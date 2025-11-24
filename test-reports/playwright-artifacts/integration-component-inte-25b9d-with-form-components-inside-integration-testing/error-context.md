# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - heading "Personal Information" [level=2] [ref=e3]:
      - button "Personal Information" [expanded] [ref=e4] [cursor=pointer]
    - generic [ref=e6]:
      - generic [ref=e7]:
        - generic [ref=e8]: First Name
        - textbox "First Name" [ref=e9]: John
      - generic [ref=e10]:
        - generic [ref=e11]: Last Name
        - textbox "Last Name" [ref=e12]: Doe
      - generic [ref=e13]:
        - generic [ref=e14]: Date of Birth
        - textbox "Date of Birth" [ref=e15]: 1990-05-15
    - heading "Contact Information" [level=2] [ref=e16]:
      - button "Contact Information" [expanded] [ref=e17] [cursor=pointer]
    - generic [ref=e19]:
      - generic [ref=e20]:
        - generic [ref=e21]: Email Address
        - textbox "Email Address" [ref=e22]: john.doe@example.com
      - generic [ref=e23]:
        - generic [ref=e24]: Phone Number
        - textbox "Phone Number" [active] [ref=e25]: (555) 123-4567
      - group "Preferred Contact Method" [ref=e26]:
        - generic [ref=e27]: Preferred Contact Method
        - generic [ref=e28]:
          - radio "Email" [ref=e29]
          - generic [ref=e30] [cursor=pointer]: Email
        - generic [ref=e31]:
          - radio "Phone" [ref=e32]
          - generic [ref=e33] [cursor=pointer]: Phone
    - heading "Preferences" [level=2] [ref=e34]:
      - button "Preferences" [ref=e35] [cursor=pointer]
  - generic [ref=e36]:
    - button "Save All Information" [ref=e37] [cursor=pointer]
    - status
```