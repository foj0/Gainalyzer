using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using AITrainer.Models;

var builder = WebApplication.CreateBuilder(args);

// Enable CORS so your React frontend can call this API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()   // allow your React app
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers();
builder.Services.AddHttpClient<HuggingFaceService>();
var app = builder.Build();

app.UseCors("AllowFrontend");

app.MapControllers();

// Simple test endpoint
app.MapGet("/", () => "Backend is running!");

app.MapPost("/analyze", async ([FromBody] AnalyzeRequest request, HuggingFaceService hf) =>
{
    Console.WriteLine("post " + JsonSerializer.Serialize(request.Logs));
    //Convert logs into a nice text summary
    var logsJson = JsonSerializer.Serialize(request.Logs, new JsonSerializerOptions
    {
        WriteIndented = true
    });
    var summary = $"Analyze the following exercise data for {request.Exercise}. " +
                  $"Analyze the provided exercise log data and provide insights about progress and trends" +
                  $"YOU MUST: respond with around 6 sentences." +
                  $"DO NOT explain your reasoning." +
                  $"DO NOT mention the instructions or the user request." +
                  $"ONLY give the analysis itself." +
                  $"ONLY consider the weight, reps, and estimated one rep max information from the logs." +
                  $" The following is the logs:" +
                  $"{logsJson}";

    // Console.WriteLine(summary);
    var result = await hf.AnalyzeAsync(summary);

    return Results.Json(new { message = result });
    //
    // foreach (var log in request.Logs)
    // {
    //     Console.WriteLine($"Date: {log.Date}");
    //     if (log.Exercise == null)
    //         Console.WriteLine(" (No exercise)");
    //     else
    //         Console.WriteLine($" Weight: {log.Exercise.Weight}, Reps: {log.Exercise.Reps}");
    // }

    // return Results.Json(new { message = "yo" });
});


// Your analyze endpoint
// app.MapPost("/analyze", ([FromBody] object chartData) =>
// {
//     // chartData will contain whatever JSON you send from React
//     Console.WriteLine("Received chart data:");
//     Console.WriteLine(chartData);
//
//     return new
//     {
//         message = "Analyzed Data",
//         received = chartData
//     };
// });

app.Run();
