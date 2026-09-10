namespace JobTracker.Api.Models;

public class JobApplication
{
    public int Id { get; set; }
    public required string Company { get; set; }
    public required string Role { get; set; }
    public required string Source { get; set; }
    public ApplicationStatus? Status { get; set; }
    public string? FollowUpStatus { get; set; }
    public required DateTime DateApplied { get; set; }
    public string? Notes { get; set; }
    public string? PostingUrl { get; set; }
}

public enum ApplicationStatus
{
    Applied,
    Assessment,
    Interviewing,
    Rejected,
    Offer
}