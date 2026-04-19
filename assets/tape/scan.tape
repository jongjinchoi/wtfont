Output assets/screenshots/scan.gif

Require wtfont

Set Shell "zsh"
Set FontSize 18
Set Width 1200
Set Height 700
Set Padding 20
Env PROMPT_EOL_MARK ""

Hide
Type "cd assets/fixtures/scan-demo"
Enter
Sleep 200ms
Ctrl+L
Sleep 100ms
Show
Type "wtfont scan ."
Sleep 500ms
Enter
Sleep 3s
Screenshot assets/screenshots/scan.png
Sleep 1s
Hide
Type "q"
Sleep 300ms
Type "cd ../../.."
Enter
