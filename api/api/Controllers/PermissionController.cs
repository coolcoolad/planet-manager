using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using api.Services;
using database.Entities;
using database.Enums;
using database.UnitOfWork;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PermissionController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly PermissionService _permissionService;

    public PermissionController(IUnitOfWork unitOfWork, PermissionService permissionService)
    {
        _unitOfWork = unitOfWork;
        _permissionService = permissionService;
    }

    [HttpGet]
    public async Task<ActionResult<List<Permission>>> GetPermissions()
    {
        var userId = GetCurrentUserId();
        if (!await _permissionService.CheckPermissionAsync(userId, "Permission", "Read"))
            return Forbid();

        var permissions = await _unitOfWork.Permissions.GetAllAsync();
        return Ok(permissions);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Permission>> GetPermission(int id)
    {
        var userId = GetCurrentUserId();
        if (!await _permissionService.CheckPermissionAsync(userId, "Permission", "Read"))
            return Forbid();

        var permission = await _unitOfWork.Permissions.GetByIdAsync(id);
        if (permission == null)
            return NotFound();

        return Ok(permission);
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<List<Permission>>> GetUserPermissions(int userId)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId != userId)
            return Forbid();
        var currentUser = await _unitOfWork.Users.GetByIdAsync(currentUserId);

        var permissions = await _unitOfWork.Permissions.Get(x => x.Role == currentUser.Role);
        return Ok(permissions);
    }

    [HttpPost]
    public async Task<ActionResult<Permission>> CreatePermission([FromBody] CreatePermissionRequest request)
    {
        var userId = GetCurrentUserId();
        if (!await _permissionService.CheckPermissionAsync(userId, "Permission", "Create"))
            return Forbid();

        var permission = new Permission
        {
            Role = request.Role,
            Resource = request.Resource,
            Action = request.Action,
            PlanetId = request.ResourceId
        };

        var createdPermission = await _unitOfWork.Permissions.CreateAsync(permission);
        return CreatedAtAction(nameof(GetPermission), new { id = createdPermission.Id }, createdPermission);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Permission>> UpdatePermission(int id, [FromBody] UpdatePermissionRequest request)
    {
        var userId = GetCurrentUserId();
        if (!await _permissionService.CheckPermissionAsync(userId, "Permission", "Update"))
            return Forbid();

        var existingPermission = await _unitOfWork.Permissions.GetByIdAsync(id);
        if (existingPermission == null)
            return NotFound();

        existingPermission.Role = request.Role;
        existingPermission.Resource = request.Resource;
        existingPermission.Action = request.Action;
        existingPermission.PlanetId = request.ResourceId;

        var updatedPermission = await _unitOfWork.Permissions.UpdateAsync(existingPermission);
        return Ok(updatedPermission);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeletePermission(int id)
    {
        var userId = GetCurrentUserId();
        if (!await _permissionService.CheckPermissionAsync(userId, "Permission", "Delete"))
            return Forbid();

        var success = await _unitOfWork.Permissions.DeleteAsync(id);
        if (!success)
            return NotFound();

        return NoContent();
    }

    [HttpPost("check")]
    public async Task<ActionResult<bool>> CheckPermission([FromBody] CheckPermissionRequest request)
    {
        var userId = GetCurrentUserId();
        var hasPermission = await _permissionService.CheckPermissionAsync(
            request.UserId ?? userId, 
            request.Resource, 
            request.Action, 
            request.ResourceId);

        return Ok(new { hasPermission });
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out int userId) ? userId : 0;
    }
}

public class CreatePermissionRequest
{
    public UserRole Role { get; set; }
    public string Resource { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public int? ResourceId { get; set; }
}

public class UpdatePermissionRequest
{
    public UserRole Role { get; set; }
    public string Resource { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public int? ResourceId { get; set; }
}

public class CheckPermissionRequest
{
    public int? UserId { get; set; }
    public string Resource { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public int? ResourceId { get; set; }
}
