namespace AITrainer.Models;

public record AnalyzeRequest(string Exercise, List<AiLog> Logs);

public class AiExercise
{
    public double Weight { get; set; }
    public int Reps { get; set; }
    public double Est1rm { get; set; }
}

public class AiLog
{
    public string Date { get; set; } = "";
    public double? Bodyweight { get; set; }
    public double? Calories { get; set; }
    public double? Protein { get; set; }
    public AiExercise? Exercise { get; set; }
}
