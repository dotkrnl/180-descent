# Commit Messages

# Change Workflow

Before making any changes, update the local branch from the remote main branch:

~~~sh
git fetch origin
git rebase origin/main
~~~

After creating any commit, rebase onto the latest remote main branch and push
main to origin:

~~~sh
git fetch origin
git rebase origin/main
git push origin main
~~~

Use Conventional Commits for commit messages, for example `feat: add day 003 lesson`, `fix: correct zh print labels`, or `docs: update add-day skill conventions`.
