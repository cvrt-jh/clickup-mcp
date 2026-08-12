# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.4] - 2026-08-12

### Added
- `clickup_add_task_to_list` and `clickup_remove_task_from_list` for multi-list
  membership (requires the paid Tasks-in-Multiple-Lists feature)

### Notes
- Documented that the ClickUp v2 API has **no** endpoint to move a task between
  lists. `POST /list/{list}/task/{task}` only adds a secondary location, and a
  `list_id` in `PUT /task/{id}` returns HTTP 200 while being silently ignored.
  A `list_id` field was deliberately NOT added to `clickup_update_task`, since it
  would report success without moving anything.

## [1.0.3] - 2026-02-02

### Added
- `clickup_create_list` tool for creating lists in folders or spaces

## [1.0.2] - 2026-02-02

### Changed
- Token-optimized responses across all tools
- Improved error handling

## [1.0.1] - 2026-02-02

### Fixed
- Package configuration for npm publishing

## [1.0.0] - 2026-02-02

### Added
- Initial release with 36 tools
- Navigation: workspaces, spaces, folders, lists
- Tasks: CRUD operations, bulk updates
- Custom fields, tags, checklists
- Dependencies, comments, members
- Token-optimized API responses (95%+ reduction)
