Output assets/screenshots/init.gif

Require wtfont

Set Shell "zsh"
Set FontSize 18
Set Width 1200
Set Height 700
Set Padding 20
Env PROMPT_EOL_MARK ""

Type "wtfont init"
Sleep 500ms
Enter
Sleep 1s

# Navigate to the 3rd theme (solarized) and confirm
Down
Sleep 300ms
Down
Sleep 500ms
Enter
Sleep 800ms

# Playwright step — skip (commercial binary opt-in)
Type "n"
Sleep 1s
Screenshot assets/screenshots/init.png
Sleep 1s
