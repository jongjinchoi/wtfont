Output assets/screenshots/lookup.gif

Require wtfont

Set Shell "zsh"
Set FontSize 18
Set Width 1200
Set Height 700
Set Padding 20
Env PROMPT_EOL_MARK ""

# Free Google Font
Type "wtfont lookup Inter"
Sleep 500ms
Enter
Sleep 2s

Sleep 1s

# Commercial font — shows the not-found path
Type `wtfont lookup "Söhne"`
Sleep 500ms
Enter
Sleep 2s
Screenshot assets/screenshots/lookup.png
Sleep 1s
