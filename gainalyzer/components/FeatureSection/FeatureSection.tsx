type Position = "left" | "right";
import Image from "next/image";
import phone_mock_charts from '@/public/phone_mock_charts.png'
import phone_mock_log from '@/public/phone_mock_log.png'
import phone_mock_goals from '@/public/phone_mock_goals.png'
import phone_mock_goals_2 from '@/public/phone_mock_goals_2.png'

function FeaturesSection() {
    const features = [
        {
            title: "Track workouts, bodyweight & more",
            text: "Track weight, reps, and any exercise with a simple and clean interface.",
            img: phone_mock_log,
            position: "left" as Position,
            number: "1"
        },
        {
            title: "Set your fitness goals",
            text: "Stay focused with daily and weekly targets. Strive for a better you.",
            img: phone_mock_goals_2,
            position: "right" as Position,
            number: "2"
        },
        {
            title: "Analyze your Progress",
            text: "Analyze your progress with visualized charts and personalized AI feedback.",
            img: phone_mock_charts,
            position: "left" as Position,
            number: "3"
        },
    ];

    return (
        <section className="relative overflow-visible">
            <h2 className="text-black text-3xl md:text-4xl font-bold text-center mb-16">
                Keep your fitness journey on track
            </h2>

            <div>
                {features.map((f, i) => (
                    <FeatureRow
                        key={i}
                        title={f.title}
                        text={f.text}
                        img={f.img}
                        position={f.position}
                        index={i}
                        number={f.number}
                    />
                ))}
            </div>
        </section>
    );
}

function FeatureRow({
    title,
    text,
    img,
    position,
    index,
    number,
}: {
    title: string;
    text: string;
    img: any;
    position: Position;
    index: number;
    number: string;
}) {
    // Overlap amounts
    const overlapClass =
        index === 0
            ? "sm:translate-y-0"
            : index === 1
                ? "sm:-translate-y-16" // second overlaps first
                : "sm:-translate-y-32"; // third overlaps second

    const imageSide =
        position === "left"
            ? "sm:order-1"
            : "sm:order-2";

    const textSide =
        position === "left"
            ? "sm:order-2"
            : "sm:order-1";

    return (
        <div className={`relative flex flex-col sm:flex-row items-center sm:justify-center sm:items-start px-4 gap-20 ${overlapClass}`}>
            {/* IMAGE */}
            <div
                className={`relative flex justify-center ${imageSide}`}
            >
                <Image
                    src={img}
                    width={473}
                    height={561}
                    alt=""
                    className={"rounded-xl shadow-xl transition-transform"}
                />
            </div>

            {/* TEXT */}
            <div className={`w-[350px] ${textSide} flex flex-col ${position === "left" ? "text-left" : "text-right"}`}>
                <h2 className="text-[#5cb25a] text-6xl font-bold mb-6">{number}</h2>
                <h3 className={`text-black text-4xl font-semibold mb-3`}>{title}</h3>
                <p className="text-gray-600 text-lg">{text}</p>
            </div>
        </div >
    );
}

export default FeaturesSection;
