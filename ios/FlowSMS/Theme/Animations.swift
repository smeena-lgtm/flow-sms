import SwiftUI

// MARK: - Custom Animations

extension Animation {
    static let smoothSpring = Animation.spring(response: 0.4, dampingFraction: 0.75, blendDuration: 0)
    static let quickSpring = Animation.spring(response: 0.3, dampingFraction: 0.7, blendDuration: 0)
    static let gentleSpring = Animation.spring(response: 0.5, dampingFraction: 0.8, blendDuration: 0)
    static let bouncy = Animation.spring(response: 0.35, dampingFraction: 0.6, blendDuration: 0)
    static let snappy = Animation.spring(response: 0.25, dampingFraction: 0.85, blendDuration: 0)
}

// MARK: - Custom Transitions

extension AnyTransition {
    static var slideUp: AnyTransition {
        AnyTransition.asymmetric(
            insertion: .move(edge: .bottom).combined(with: .opacity),
            removal: .move(edge: .top).combined(with: .opacity)
        )
    }

    static var fadeScale: AnyTransition {
        AnyTransition.asymmetric(
            insertion: .scale(scale: 0.9).combined(with: .opacity),
            removal: .scale(scale: 1.05).combined(with: .opacity)
        )
    }

    static var slideFromTrailing: AnyTransition {
        AnyTransition.asymmetric(
            insertion: .move(edge: .trailing).combined(with: .opacity),
            removal: .move(edge: .leading).combined(with: .opacity)
        )
    }

    static var cardAppear: AnyTransition {
        AnyTransition.asymmetric(
            insertion: .scale(scale: 0.95).combined(with: .opacity).combined(with: .offset(y: 10)),
            removal: .opacity
        )
    }
}

// MARK: - Animated Card Modifier

struct AnimatedCardModifier: ViewModifier {
    let index: Int
    @State private var isVisible = false

    func body(content: Content) -> some View {
        content
            .opacity(isVisible ? 1 : 0)
            .offset(y: isVisible ? 0 : 20)
            .scaleEffect(isVisible ? 1 : 0.95)
            .onAppear {
                withAnimation(.smoothSpring.delay(Double(index) * 0.05)) {
                    isVisible = true
                }
            }
    }
}

extension View {
    func animatedCard(index: Int) -> some View {
        modifier(AnimatedCardModifier(index: index))
    }
}

// MARK: - Shimmer Loading Effect

struct ShimmerModifier: ViewModifier {
    @State private var phase: CGFloat = 0

    func body(content: Content) -> some View {
        content
            .overlay(
                LinearGradient(
                    gradient: Gradient(colors: [
                        .clear,
                        .white.opacity(0.1),
                        .clear
                    ]),
                    startPoint: .leading,
                    endPoint: .trailing
                )
                .offset(x: phase)
                .mask(content)
            )
            .onAppear {
                withAnimation(.linear(duration: 1.5).repeatForever(autoreverses: false)) {
                    phase = 400
                }
            }
    }
}

extension View {
    func shimmer() -> some View {
        modifier(ShimmerModifier())
    }
}

// MARK: - Pulse Animation

struct PulseModifier: ViewModifier {
    @State private var isPulsing = false

    func body(content: Content) -> some View {
        content
            .scaleEffect(isPulsing ? 1.02 : 1.0)
            .opacity(isPulsing ? 0.9 : 1.0)
            .onAppear {
                withAnimation(.easeInOut(duration: 1.2).repeatForever(autoreverses: true)) {
                    isPulsing = true
                }
            }
    }
}

extension View {
    func pulse() -> some View {
        modifier(PulseModifier())
    }
}

// MARK: - Fade In Modifier

struct FadeInModifier: ViewModifier {
    let delay: Double
    @State private var isVisible = false

    func body(content: Content) -> some View {
        content
            .opacity(isVisible ? 1 : 0)
            .onAppear {
                withAnimation(.easeOut(duration: 0.4).delay(delay)) {
                    isVisible = true
                }
            }
    }
}

extension View {
    func fadeIn(delay: Double = 0) -> some View {
        modifier(FadeInModifier(delay: delay))
    }
}

// MARK: - Scale Button Style

struct ScaleButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.96 : 1.0)
            .opacity(configuration.isPressed ? 0.9 : 1.0)
            .animation(.quickSpring, value: configuration.isPressed)
    }
}

// MARK: - Bounce Button Style

struct BounceButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.92 : 1.0)
            .animation(.bouncy, value: configuration.isPressed)
    }
}

// MARK: - Loading Spinner

struct LoadingSpinner: View {
    @State private var isAnimating = false

    var body: some View {
        Circle()
            .trim(from: 0, to: 0.7)
            .stroke(
                LinearGradient(
                    colors: [.oceanSwell, .oceanSwell.opacity(0.3)],
                    startPoint: .leading,
                    endPoint: .trailing
                ),
                style: StrokeStyle(lineWidth: 3, lineCap: .round)
            )
            .frame(width: 32, height: 32)
            .rotationEffect(.degrees(isAnimating ? 360 : 0))
            .onAppear {
                withAnimation(.linear(duration: 0.8).repeatForever(autoreverses: false)) {
                    isAnimating = true
                }
            }
    }
}

// MARK: - Skeleton Loading View

struct SkeletonView: View {
    let height: CGFloat

    var body: some View {
        RoundedRectangle(cornerRadius: 8)
            .fill(Color.bgHover)
            .frame(height: height)
            .shimmer()
    }
}

// MARK: - Animated Number

struct AnimatedNumber: View {
    let value: Int
    @State private var displayValue: Int = 0

    var body: some View {
        Text("\(displayValue)")
            .onAppear {
                animateValue()
            }
            .onChange(of: value) { _, newValue in
                animateValue()
            }
    }

    private func animateValue() {
        let steps = 20
        let stepDuration = 0.02
        let increment = max(1, (value - displayValue) / steps)

        for i in 0...steps {
            DispatchQueue.main.asyncAfter(deadline: .now() + Double(i) * stepDuration) {
                if i == steps {
                    displayValue = value
                } else {
                    displayValue = min(displayValue + increment, value)
                }
            }
        }
    }
}

#Preview {
    VStack(spacing: 20) {
        LoadingSpinner()

        SkeletonView(height: 60)
            .padding()

        AnimatedNumber(value: 1234)
            .font(.largeTitle)
    }
    .padding()
    .background(Color.bgDark)
}
