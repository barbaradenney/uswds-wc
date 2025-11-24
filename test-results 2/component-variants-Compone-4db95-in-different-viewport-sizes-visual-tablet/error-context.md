# Page snapshot

```yaml
- generic [ref=e1]:
  - button [ref=e5] [cursor=pointer]: Open Modal
  - dialog "Modal Heading":
    - dialog [active] [ref=e7]:
      - generic [ref=e8]:
        - generic [ref=e9]:
          - heading "Modal Heading" [level=2] [ref=e10]
          - paragraph [ref=e12]: This is a basic modal dialog with default settings.
          - list [ref=e15]:
            - listitem [ref=e16]:
              - button "Continue" [ref=e17] [cursor=pointer]
            - listitem [ref=e18]:
              - button "Cancel" [ref=e19] [cursor=pointer]
        - button "Close this window" [ref=e20] [cursor=pointer]:
          - img
```