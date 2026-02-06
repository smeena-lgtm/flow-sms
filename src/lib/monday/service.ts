// Monday.com API Service
// Handles all GraphQL queries to Monday.com for project timeline reporting

const MONDAY_API_URL = "https://api.monday.com/v2"

// Types for Monday.com data
export interface MondayItem {
  id: string
  name: string
  state: string // active, archived, deleted
  column_values: MondayColumnValue[]
}

export interface MondayColumnValue {
  id: string
  title: string
  text: string | null
  value: string | null
  type: string
}

export interface MondayStatusValue {
  label: string
  style: {
    color: string
  }
}

export interface MondayTimelineValue {
  from: string // YYYY-MM-DD
  to: string   // YYYY-MM-DD
}

export interface MondayBoardData {
  id: string
  name: string
  description: string | null
  state: string
  items_page: {
    cursor: string | null
    items: MondayItem[]
  }
  columns: {
    id: string
    title: string
    type: string
  }[]
}

export interface MondayProjectMetrics {
  boardId: string
  boardName: string
  totalItems: number
  completedItems: number
  inProgressItems: number
  stuckItems: number
  notStartedItems: number
  completionPercentage: number
  timeline: {
    earliestStart: string | null
    latestEnd: string | null
  }
  items: {
    id: string
    name: string
    status: string
    statusColor: string
    timeline: MondayTimelineValue | null
  }[]
  lastFetched: string
}

class MondayService {
  private apiToken: string | null = null

  constructor() {
    this.apiToken = process.env.MONDAY_API_TOKEN || null
  }

  private async query<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    if (!this.apiToken) {
      throw new Error("Monday.com API token not configured")
    }

    const response = await fetch(MONDAY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": this.apiToken,
        "API-Version": "2024-01",
      },
      body: JSON.stringify({ query, variables }),
    })

    if (!response.ok) {
      throw new Error(`Monday.com API error: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()

    if (result.errors && result.errors.length > 0) {
      throw new Error(`Monday.com GraphQL error: ${result.errors[0].message}`)
    }

    return result.data
  }

  async getBoardData(boardId: string): Promise<MondayBoardData | null> {
    const query = `
      query GetBoard($boardId: [ID!]) {
        boards(ids: $boardId) {
          id
          name
          description
          state
          columns {
            id
            title
            type
          }
          items_page(limit: 500) {
            cursor
            items {
              id
              name
              state
              column_values {
                id
                text
                value
                type
                ... on StatusValue {
                  label
                  update_id
                }
                ... on TimelineValue {
                  from
                  to
                }
              }
            }
          }
        }
      }
    `

    try {
      const data = await this.query<{ boards: MondayBoardData[] }>(query, {
        boardId: [boardId],
      })

      return data.boards[0] || null
    } catch (error) {
      console.error("Failed to fetch Monday.com board:", error)
      throw error
    }
  }

  async getProjectMetrics(boardId: string): Promise<MondayProjectMetrics> {
    const board = await this.getBoardData(boardId)

    if (!board) {
      throw new Error(`Board not found: ${boardId}`)
    }

    const items = board.items_page.items

    // Find status and timeline columns
    const statusColumn = board.columns.find(c => c.type === "status" || c.type === "color")
    const timelineColumn = board.columns.find(c => c.type === "timeline")

    // Process items to extract status and timeline
    const processedItems = items.map(item => {
      const statusValue = statusColumn
        ? item.column_values.find(cv => cv.id === statusColumn.id)
        : null

      const timelineValue = timelineColumn
        ? item.column_values.find(cv => cv.id === timelineColumn.id)
        : null

      // Parse status
      let status = "Not Started"
      let statusColor = "#c4c4c4"

      if (statusValue?.value) {
        try {
          const parsed = JSON.parse(statusValue.value)
          status = statusValue.text || parsed.label || "Not Started"
          statusColor = parsed.color || "#c4c4c4"
        } catch {
          status = statusValue.text || "Not Started"
        }
      }

      // Parse timeline
      let timeline: MondayTimelineValue | null = null
      if (timelineValue?.value) {
        try {
          const parsed = JSON.parse(timelineValue.value)
          if (parsed.from && parsed.to) {
            timeline = { from: parsed.from, to: parsed.to }
          }
        } catch {
          // Timeline parsing failed
        }
      }

      return {
        id: item.id,
        name: item.name,
        status,
        statusColor,
        timeline,
      }
    })

    // Calculate metrics
    const statusCounts = {
      completed: 0,
      inProgress: 0,
      stuck: 0,
      notStarted: 0,
    }

    processedItems.forEach(item => {
      const statusLower = item.status.toLowerCase()
      if (statusLower.includes("done") || statusLower.includes("complete")) {
        statusCounts.completed++
      } else if (statusLower.includes("stuck") || statusLower.includes("block")) {
        statusCounts.stuck++
      } else if (statusLower.includes("progress") || statusLower.includes("working")) {
        statusCounts.inProgress++
      } else {
        statusCounts.notStarted++
      }
    })

    // Calculate timeline bounds
    let earliestStart: string | null = null
    let latestEnd: string | null = null

    processedItems.forEach(item => {
      if (item.timeline) {
        if (!earliestStart || item.timeline.from < earliestStart) {
          earliestStart = item.timeline.from
        }
        if (!latestEnd || item.timeline.to > latestEnd) {
          latestEnd = item.timeline.to
        }
      }
    })

    const totalItems = processedItems.length
    const completionPercentage = totalItems > 0
      ? Math.round((statusCounts.completed / totalItems) * 100)
      : 0

    return {
      boardId: board.id,
      boardName: board.name,
      totalItems,
      completedItems: statusCounts.completed,
      inProgressItems: statusCounts.inProgress,
      stuckItems: statusCounts.stuck,
      notStartedItems: statusCounts.notStarted,
      completionPercentage,
      timeline: {
        earliestStart,
        latestEnd,
      },
      items: processedItems,
      lastFetched: new Date().toISOString(),
    }
  }

  isConfigured(): boolean {
    return !!this.apiToken
  }
}

export const mondayService = new MondayService()
