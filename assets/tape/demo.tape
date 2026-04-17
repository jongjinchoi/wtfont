Output assets/screenshots/demo.gif

Require wtfont

Set Shell "zsh"
Set FontSize 18
Set Width 1200
Set Height 700
Set Padding 20
Env PROMPT_EOL_MARK ""

# Detect fonts on a live site
Type "wtfont analyze vercel.com"
Sleep 500ms
Enter
Sleep 6s
Screenshot assets/screenshots/demo-analyze.png

Type "clear"
Enter
Sleep 300ms

# Check whether a detected font is free
Type "wtfont lookup Geist"
Sleep 500ms
Enter
Sleep 2s

Type "clear"
Enter
Sleep 300ms

# Generate copy-paste code
Type "wtfont code Geist --framework nextjs --weights 400,500,700"
Sleep 500ms
Enter
Sleep 3s
Screenshot assets/screenshots/demo-code.png
Sleep 1s
