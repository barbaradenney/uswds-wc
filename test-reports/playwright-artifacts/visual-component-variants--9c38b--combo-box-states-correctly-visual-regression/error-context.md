# Page snapshot

```yaml
- generic [ref=e6]:
  - generic [ref=e7]: Select a fruit
  - generic [ref=e8]:
    - combobox [ref=e9]
    - combobox "Select a fruit" [expanded] [active] [ref=e10]:
      - text: ap
      - listbox "Select a fruit" [ref=e11]:
        - option "Apple" [ref=e12] [cursor=pointer]
        - option "Apricot" [ref=e13] [cursor=pointer]
        - option "Crab apple" [ref=e14] [cursor=pointer]
        - option "Custard apple" [ref=e15] [cursor=pointer]
        - option "Grape" [ref=e16] [cursor=pointer]
        - option "Grapefruit" [ref=e17] [cursor=pointer]
        - option "Papaya" [ref=e18] [cursor=pointer]
        - option "Pineapple" [ref=e19] [cursor=pointer]
    - button "Toggle the dropdown list" [ref=e21] [cursor=pointer]
    - status [ref=e22]: 8 results available.
```