---
sidebar_position: 1
title: 'What are scripts?'
slug: /scripts
---

Unfortunately, the PEGA platform's Client For Windows (CFW), does not handle many of the necessary functionality needed for our application. So, we will utilize Javascript in order to achieve that functionality.

### Javascript:
```Javascript
function myTestFunc() {
    let myVar = 0;
    return myVar;
}
```

 As such, we have carefully designed a framework in order to make this process easier. Additionally, we have set some conventions to make development, scaling, and future maintainence easier. Specifically, we try our best to create a 1 - 1 relationship between PEGA rules and our script files. In the sidebar here on the left, you will see collapsable groups, each representing cases and their cases. The directly correlate to their rule counterparts in PEGA.