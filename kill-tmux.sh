#!/bin/bash

# Kill the tmux session if it exists
tmux has-session -t clarkify-backend 2>/dev/null
if [ $? -eq 0 ]; then
    tmux kill-session -t clarkify-backend
    echo "Killed tmux session: clarkify-backend"
else
    echo "No tmux session found: clarkify-backend"
fi
