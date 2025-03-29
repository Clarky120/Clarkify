#!/bin/bash

# Check if session exists and attach if it does
tmux has-session -t clarkify-backend 2>/dev/null
if [ $? -eq 0 ]; then
    tmux attach -t clarkify-backend
    exit
fi

# Start a new tmux session in the background
tmux new-session -d -s clarkify-backend

# Split into three columns
tmux split-window -h
tmux split-window -h

# Remove vertical splits to have just 1 row with 3 columns

# Send commands to panes
# Left column
tmux send-keys -t clarkify-backend:0.0 'nvm use 22 && sh emu.sh' C-m

# Middle column
tmux send-keys -t clarkify-backend:0.1 'nvm use 22 && sh bff.sh' C-m

# Right column
tmux send-keys -t clarkify-backend:0.2 'nvm use 22 && cd admin && ng serve --host 0.0.0.0' C-m

# Attach to the session
tmux attach -t clarkify-backend
