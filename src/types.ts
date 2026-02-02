import { z } from "zod";

// Reusable Zod schemas for tool inputs

export const taskId = z.string().describe("ClickUp task ID");
export const listId = z.string().describe("ClickUp list ID");
export const spaceId = z.string().describe("ClickUp space ID");
export const folderId = z.string().describe("ClickUp folder ID");
export const teamId = z.string().describe("ClickUp workspace/team ID");
export const checklistId = z.string().describe("Checklist ID");
export const commentId = z.string().describe("Comment ID");

export const priority = z.number().min(1).max(4).optional()
  .describe("Priority: 1=urgent, 2=high, 3=normal, 4=low");

export const assignees = z.array(z.number()).optional()
  .describe("Array of user IDs to assign");

export const tags = z.array(z.string()).optional()
  .describe("Array of tag names");

export const dueDate = z.number().optional()
  .describe("Due date as Unix timestamp in milliseconds");

export const startDate = z.number().optional()
  .describe("Start date as Unix timestamp in milliseconds");

export const timeEstimate = z.number().optional()
  .describe("Time estimate in milliseconds");

export const customFieldValue = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
  z.object({}).passthrough(),
]).describe("Custom field value (type depends on field type)");

// Helper to format tool results
export function jsonResult(data: unknown): { content: Array<{ type: "text"; text: string }> } {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}
