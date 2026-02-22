# Code implementation flow

For every new feature:

- create a git worktree to work on the feature described
- use Typescript as default language, unless told otherwise
- ALWAYS work using TDD with red/green flow ALWAYS
- separate domain logic from CLI/UI/WebAPI, unless told otherwise
- every UI/WebAPI feature should have parity with a CLI way of testing that feature
- before commiting: run all new unit tests, validate coverage is over 90%, use cli to test new feature. if any of this fail, fix the issues
- before committing: run Playwright browser-based validation against the running dev server to manually verify all new and existing UI features work end-to-end. Take screenshots as evidence and save them to the `screenshots/` folder (gitignored) to avoid polluting the repo.
- document the new feature in the code and in the project documentation, including any design decisions, trade-offs, and future considerations.
- <important> always commit after you finish your work with a message that explain both what is done, the context and a trail of the though process you made</important>
