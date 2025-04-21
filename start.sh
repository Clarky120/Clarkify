#!/bin/bash

SESSION_NAME="clarkify"
LAYOUT_FILE="layout.kdl"

zellij --session "$SESSION_NAME" --new-session-with-layout "$LAYOUT_FILE"
