# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Open Modal" [ref=e5] [cursor=pointer]
  - dialog [ref=e6]:
    - generic [ref=e7]:
      - generic [ref=e8]:
        - heading "Modal Heading" [level=2] [ref=e9]
        - paragraph [ref=e11]: This is a basic modal dialog with default settings.
        - list [ref=e14]:
          - listitem [ref=e15]:
            - button "Continue" [ref=e16] [cursor=pointer]
          - listitem [ref=e17]:
            - button "Cancel" [ref=e18] [cursor=pointer]
      - button "Close this window" [ref=e19] [cursor=pointer]:
        - img
```