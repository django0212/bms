# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]: BookMyCampus
      - generic [ref=e6]: Enter your university email to sign in
    - generic [ref=e7]:
      - generic [ref=e8]:
        - generic [ref=e9]:
          - text: Email
          - textbox "Email" [ref=e10]:
            - /placeholder: you@university.edu
        - generic [ref=e11]:
          - text: Password
          - textbox "Password" [ref=e12]:
            - /placeholder: ••••••••
        - button "Sign In" [ref=e13] [cursor=pointer]
      - paragraph [ref=e15]: Don't have an account? Contact your university administrator.
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e21] [cursor=pointer]:
    - img [ref=e22]
  - alert [ref=e25]
```