using Microsoft.AspNetCore.Mvc;

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

var app = builder.Build();

app.UseCors("AllowFrontend");

app.MapControllers();

// Simple test endpoint
app.MapGet("/", () => "Backend is running!");

// Your analyze endpoint
app.MapPost("/analyze", ([FromBody] object chartData) =>
{
    // chartData will contain whatever JSON you send from React
    Console.WriteLine("Received chart data:");
    Console.WriteLine(chartData);

    return new
    {
        message = "Analyzed Data",
        received = chartData
    };
});

app.Run();
