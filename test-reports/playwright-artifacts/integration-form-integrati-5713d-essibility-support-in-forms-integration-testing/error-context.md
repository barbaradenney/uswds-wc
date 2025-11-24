# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - generic [ref=e4]: Required Field *
    - textbox "Required Field *" [active] [ref=e5]: Test value
    - generic [ref=e6]: This field is required for processing
    - generic [ref=e7]: This field is required
  - generic [ref=e8]:
    - generic [ref=e9]: Date of Birth
    - generic [ref=e10]: Enter in MM/DD/YYYY format
    - textbox "Date of Birth" [ref=e11]
  - group "Preferred Contact Method *" [ref=e12]:
    - generic [ref=e13]: Preferred Contact Method *
    - generic [ref=e14]:
      - radio "Email" [ref=e15]
      - generic [ref=e16] [cursor=pointer]: Email
    - generic [ref=e17]:
      - radio "Phone" [ref=e18]
      - generic [ref=e19] [cursor=pointer]: Phone
    - generic [ref=e20]:
      - radio "Mail" [ref=e21]
      - generic [ref=e22] [cursor=pointer]: Mail
    - generic [ref=e23]: Please select a contact method
  - button "Submit" [ref=e24] [cursor=pointer]
  - status [ref=e25]:
    - generic [ref=e27]: Please correct the errors above.
```