Output assets/screenshots/themes.gif

Require wtfont

Set Shell "zsh"
Set FontSize 18
Set Width 1200
Set Height 700
Set Padding 20
Env PROMPT_EOL_MARK ""

# default
Hide
Type "wtfont config theme default"
Enter
Sleep 500ms
Type "wtfont browse sans-serif --limit 10"
Enter
Sleep 2s
Show
Sleep 1s
Screenshot assets/screenshots/theme-default.png
Sleep 500ms

# monochrome
Hide
Type "clear"
Enter
Sleep 300ms
Type "wtfont config theme monochrome"
Enter
Sleep 500ms
Type "wtfont browse sans-serif --limit 10"
Enter
Sleep 2s
Show
Sleep 1s
Screenshot assets/screenshots/theme-monochrome.png
Sleep 500ms

# solarized
Hide
Type "clear"
Enter
Sleep 300ms
Type "wtfont config theme solarized"
Enter
Sleep 500ms
Type "wtfont browse sans-serif --limit 10"
Enter
Sleep 2s
Show
Sleep 1s
Screenshot assets/screenshots/theme-solarized.png
Sleep 500ms

# catppuccin-mocha
Hide
Type "clear"
Enter
Sleep 300ms
Type "wtfont config theme catppuccin-mocha"
Enter
Sleep 500ms
Type "wtfont browse sans-serif --limit 10"
Enter
Sleep 2s
Show
Sleep 1s
Screenshot assets/screenshots/theme-catppuccin-mocha.png
Sleep 500ms

# dracula
Hide
Type "clear"
Enter
Sleep 300ms
Type "wtfont config theme dracula"
Enter
Sleep 500ms
Type "wtfont browse sans-serif --limit 10"
Enter
Sleep 2s
Show
Sleep 1s
Screenshot assets/screenshots/theme-dracula.png
Sleep 500ms

# catppuccin-latte (light)
Hide
Type "clear"
Enter
Sleep 300ms
Type "wtfont config theme catppuccin-latte"
Enter
Sleep 500ms
Type "wtfont browse sans-serif --limit 10"
Enter
Sleep 2s
Show
Sleep 1s
Screenshot assets/screenshots/theme-catppuccin-latte.png
Sleep 500ms

# rose-pine-dawn (light)
Hide
Type "clear"
Enter
Sleep 300ms
Type "wtfont config theme rose-pine-dawn"
Enter
Sleep 500ms
Type "wtfont browse sans-serif --limit 10"
Enter
Sleep 2s
Show
Sleep 1s
Screenshot assets/screenshots/theme-rose-pine-dawn.png
Sleep 500ms

# Restore default
Hide
Type "wtfont config theme default"
Enter
Sleep 300ms
