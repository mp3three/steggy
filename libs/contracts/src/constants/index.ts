export * from './global';
export * from './config';

"Cameron Contour" GIT_COMMITTER_EMAIL="cameron@form.io" git commit --amend --no-edit --author="Cameron Contour <cameron@form.io>"
git rebase -i $COMMIT~1^^
