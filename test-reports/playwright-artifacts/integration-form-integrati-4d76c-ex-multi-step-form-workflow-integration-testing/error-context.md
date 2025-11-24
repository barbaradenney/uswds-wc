# Page snapshot

```yaml
- generic [ref=e3]:
  - heading "Business Permit Application" [level=1] [ref=e4]
  - generic "Progress" [ref=e5]:
    - list [ref=e6]:
      - listitem [ref=e7]:
        - generic [ref=e8]: Business Information
      - listitem [ref=e9]:
        - generic [ref=e10]: Owner Information
      - listitem [ref=e11]:
        - generic [ref=e12]: Permit Details
      - listitem [ref=e13]:
        - generic [ref=e14]: Review & Submit
  - generic [ref=e15]:
    - generic [ref=e16]:
      - group "Owner Information" [ref=e17]:
        - generic [ref=e18]: Owner Information
        - generic [ref=e19]:
          - generic [ref=e20]:
            - generic [ref=e21]: First Name *
            - textbox "First Name *" [ref=e22]: Jane
          - generic [ref=e23]:
            - generic [ref=e24]: Last Name *
            - textbox "Last Name *" [ref=e25]: Smith
        - generic [ref=e26]: Email Address *
        - textbox "Email Address *" [ref=e27]: jane.smith@testbusiness.com
        - generic [ref=e28]: Phone Number *
        - textbox "Phone Number *" [active] [ref=e29]: (555) 987-6543
      - generic [ref=e30]:
        - button "Back" [ref=e31] [cursor=pointer]
        - button "Continue" [ref=e32] [cursor=pointer]
    - status
```