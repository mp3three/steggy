##########################
#### BREW
##########################
if ! command -v brew &> /dev/null
then
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

MISSING_BREW=""
# Sanity check
# git-secret
CMD=$(git secret)
RESULT=$?
if [ $RESULT -eq 1 ]; then
  MISSING_BREW="$MISSING_BREW git-secret"
fi
if ! command -v wget &> /dev/null
then
  MISSING_BREW="$MISSING_BREW wget"
fi
if ! command -v cowsay &> /dev/null
then
  MISSING_BREW="$MISSING_BREW cowsay"
fi
if ! command -v fortune &> /dev/null
then
  MISSING_BREW="$MISSING_BREW fortune"
fi
if ! command -v lolcat &> /dev/null
then
  MISSING_BREW="$MISSING_BREW lolcat"
fi
if ! command -v curl &> /dev/null
then
  MISSING_BREW="$MISSING_BREW curl"
fi
if [[ "$MISSING_BREW" == *" "* ]]; then
  COMMAND="brew install $MISSING_BREW"
  echo $COMMAND
  echo $COMMAND | sh
fi

##########################
#### NODE
##########################
if [ $(echo $NVM_DIR | wc -w) -eq "0" ];
then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

  nvm install 16
  nvm use 16
  nvm alias default 16
fi
MISSING_MODULES=""
if ! command -v yarn &> /dev/null
then
  MISSING_MODULES="$MISSING_MODULES yarn"
fi
if ! command -v nx &> /dev/null
then
  MISSING_MODULES="$MISSING_MODULES nx"
fi
if ! command -v terser &> /dev/null
then
  MISSING_MODULES="$MISSING_MODULES terser"
fi
if ! command -v pino-pretty &> /dev/null
then
  MISSING_MODULES="$MISSING_MODULES pino-pretty"
fi
if ! command -v tsc &> /dev/null
then
  MISSING_MODULES="$MISSING_MODULES typescript"
fi
if ! command -v jest &> /dev/null
then
  MISSING_MODULES="$MISSING_MODULES jest"
fi
if ! command -v license-checker &> /dev/null
then
  MISSING_MODULES="$MISSING_MODULES license-checker"
fi
if ! command -v compodoc &> /dev/null
then
  MISSING_MODULES="$MISSING_MODULES @compodoc/compodoc"
fi
if ! command -v git-split-diffs &> /dev/null
then
  MISSING_MODULES="$MISSING_MODULES git-split-diffs"
fi
if [[ "$MISSING_MODULES" == *" "* ]]; then
  COMMAND="npm install -g $MISSING_MODULES"
  echo $COMMAND
  echo $COMMAND | sh
fi

if ! test -f .husky/_/husky.sh; then
  npx husky install
fi

##########################
#### PATH
##########################

SUB='support-tools'
if [[ "$PATH" != *"$SUB"* ]]; then
  PWD=$(printf "%q\n" "$(pwd)")
  export PATH="$PATH:$PWD/apps/support-tools/scripts"
  if test -f ~/.zshrc; then
    echo "export PATH=\"$PATH:$PWD/apps/support-tools/scripts\"" >> ~/.zshrc
  fi
  if test -f ~/.bash_profile; then
    echo "export PATH=\"$PATH:$PWD/apps/support-tools/scripts\"" >> ~/.bash_profile
  fi
  echo "export PATH=\"$PATH:$PWD/apps/support-tools/scripts\"" >> ~/.bashrc
fi
SUB='devtools'
if [[ "$PATH" != *"$SUB"* ]]; then
  PWD=$(printf "%q\n" "$(pwd)")
  export PATH="$PATH:$PWD/apps/devtools/scripts"
  if test -f ~/.zshrc; then
    echo "export PATH=\"\$PATH:$PWD/apps/devtools/scripts\"" >> ~/.zshrc
  fi
  if test -f ~/.bash_profile; then
    echo "export PATH=\"\$PATH:$PWD/apps/devtools/scripts\"" >> ~/.bash_profile
  fi
  echo "export PATH=\"\$PATH:$PWD/apps/devtools/scripts\"" >> ~/.bashrc
fi
