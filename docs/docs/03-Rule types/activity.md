---
sidebar_position: 1
title: "Activity"
---

# Activity

## Overview

Out of the box, CfW offers no support whatsoever for activities.

Using EPOC, activities with a certain set of supported methods can be configured for offline. Such activities can be called through a function, as flow action pre/post processing, or from UI actions.

In addition to using a limited set of methods, best results will be achieved if activities adhere to the following:

1. Avoid defining a method directly in the same step with Loop configured. Add the method as a child step instead.
2. Avoid the use of Jump. Create an additional step with a When instead if needed.
3. Use step pages only where it is essential to do so. Many EPOC methods do not support step pages. For example, during Property-Set, the page should be explicitly referred to
4. Avoid use of multiple lines in a When statement. Combine them into a single line or split the lines into multiple activity steps.
5. Limit the use of "jump to later step".
   - It is permitted to use it for exception handling and for breaking out of a loop. See Pseudo-methods.
   - When it is used to skip multiple steps, instead group the steps to be skipped under a common parent For loop that executes exactly one, with a when condition indicating when the "block" should be run or skipped.

## Placement within class

Each activity is implemented as a function inside of the activity map of the [rules prototype](/docs/Script%20basics/rulesPrototype) for the class.

For example, the following class defines one activity, called UpdateQuantitiesAndSerials.

```javascript
class GCSS_DiscOps_Work_Goods_Issue extends GCSS_DiscOps_Work_Goods_Issue {
  static _rulesPrototype = {
    activity: {
      UpdateQuantitiesAndSerials: (Primary, myStepPage, Param) => {
        //activity body here
      },
    },
  };
}
```

### Inheritance

See [Inheritance](http://localhost:3000/docs/Script%20basics/inheritance).

Activities defined in a parent class can be run in the context of a child class, without requiring the rule to be defined in the rules prototype of the latter. If the same rule name is defined in the parent class and child class, the child's function will be used at runtime.

## Defining the function

### Arguments

Each function should accept 3 arguments. When invoked by the platform, a [ClipboardReference](/docs/Script%20basics/proxyObjects#clipboardreference) pointing to the primary page will be passed for the first two arguments, and a [ParameterPage](/docs/Script%20basics/proxyObjects#parameterpage) will be passed as the third argument.

:::tip

As a best practice, name these arguments Primary, myStepPage, and Param, so that expressions can be built exactly as they would be in a transform rule. The same reference is passed for both the first and second argument, so that a flexible syntax can be used when building expressions.

:::

### Pages & Classes

Except for the primary page, any top-level page referenced within the body of the activity should be declared at the top of the function. For a named page of a given class, bind the variable to a new instance of that page pointing to the page name. For example:

```javascript
const NewEquipment = new GCSS_DiscOps_Data_Equipment("NewEquipment");
```

For a name paged where the class is $ANY or the class otherwise does not matter, bind it to a ClipboardReference instead. For example:

```javascript
const TempPage = new ClipboardReference("TempPage");
```

If a page name parameter is used, use a variable with the same name as the parameter, but refer to the parameter page when constructing the new instance. For example:

```javascript
const EquipPage = new GCSS_DiscOps_Data_Equipment(Param.EquipPage);
```

### Organization

For best readability, modify code using VSCode with Prettier extension. It is recommended to use a tab size of 2, and configure Prettier with a very large print width (800+).

The goal with this formatting is to ensure each plain activity step is represented by exactly one line. Steps with children always include a function as one of their arguments. The formatting will ensure that the child steps are each put on their own new line with an additional tab, following the tree structure of the rule form.

For example, this is a somewhat complex activity with multiple levels of child steps:

![Example](/img/activityExample01.png)

This is how the same activity may be written as a function. Each step is represented by one call to an Activity static method, and the indentation follows the tree structure of the activity steps.

```javascript
UpdateQuantitiesAndSerials: async (Primary, myStepPage, Param) => {
  const MaterialOnHand = new GCSS_DiscOps_Data_MaterialOnHand("MaterialOnHand");
  const Requirement = new GCSS_DiscOps_Data_Requirement("Requirement");

  await Activity.call("SaveSyncStatus");
  Activity.propertySet([[myStepPage.Data.CaseStatus, "Resolved-Completed"]]);
  await Activity.forEachEmbedded(myStepPage.Data.EligibleMaterialOnHandList, async (myStepPage) => {
    Activity.when([[myStepPage.Data.EligibleMaterialOnHandList.QuantityToIssue > 0, continueWhens, exitIteration]]);
    Activity.pageCopy(myStepPage, MaterialOnHand);
    Activity.propertySet([[MaterialOnHand.Stock, MaterialOnHand.Stock - Rule.function.toDecimal(myStepPage.QuantityToIssue)]]);
    Activity.propertyRemove([MaterialOnHand.Type, MaterialOnHand.QuantityToIssue, MaterialOnHand.pyIsSelected, MaterialOnHand.PegaID, MaterialOnHand.pxPages, MaterialOnHand.IsSubstitute]);
    await Activity.objSave(MaterialOnHand);
  });
  await Activity.whenBlock("", myStepPage, true, async (myStepPage) => {
    Activity.pageCopy("", myStepPage.Data.ManualReservation, Requirement);
    Activity.propertySet("", [[Requirement.QuantityWithdrawn, Requirement.QuantityWithdrawn + myStepPage.Data.QuantityToIssueTotal]]);
    Activity.propertyRemove("", [Requirement.MaterialType, Requirement.MaterialOnHand, Requirement.pxPages]);
    await Activity.objSave("", Requirement);
  });
  Activity.pageRemove("", [MaterialOnHand, Requirement]);
};
```

### Methods

Each step method is represented one-to-one by a static method of the Activity object, as indicated below:

| Method                                       | Function                    | Arguments                             |
| -------------------------------------------- | --------------------------- | ------------------------------------- |
| [Call](#call)                                | Activity.call               | (activityName, stepPage)              |
| [Apply-DataTransform](#apply-data-transform) | Activity.applyDataTransform | (transformName, parameters, stepPage) |
| [Commit](#commit)                            | Activity.commit             | ()                                    |
| [Exit-Activity](#exit-activity)              | Activity.exitActivity       | ()                                    |
| [Obj-Delete](#obj-delete)                    | Activity.delete             | (stepPage)                            |
| [Obj-Save](#obj-save)                        | Activity.objSave            | (stepPage)                            |
| [Obj-Sort](#obj-sort)                        | Activity.objSort            | (target, sortProperties)              |
| [Obj-Validate](#obj-validate)                | Activity.objValidate        | (validateName, stepPage)              |
| [Page-Clear-Messages](#page-clear-messages)  | Activity.pageClearMessages  | (stepPage)                            |
| [Page-Copy](#page-copy)                      | Activity.pageCopy           | (copyFrom, copyInto)                  |
| [Page-Merge-Into](#page-merge-into)          | Activity.pageMergeInto      | (keep, mergeFromList, stepPage)       |
| [Page-New](#page-new)                        | Activity.pageNew            | (stepPage)                            |
| [Page-Remove](#page-remove)                  | Activity.pageRemove         | (pages)                               |
| [Property-Remove](#property-remove)          | Activity.propertyRemove     | (properties)                          |
| [Property-Set](#property-set)                | Activity.propertySet        | (propertyValuePairs)                  |
| [RDB-Delete](#rdb-delete)                    | Activity.rdbDelete          | (class, requestType)                  |
| [RDB-List](#rdb-list)                        | Activity.rdbList            | (class, requestType)                  |
| [RDB-Open](#rdb-open)                        | Activity.rdbOpen            | (class, requestType)                  |
| [RDB-Save](#rdb-save)                        | Activity.rdbSave            | (class, requestType)                  |

:::danger

:::

For more information on configuring client store to support database interactions, see XXX.

### Pseudo-Methods

When configuring a step without a method, such as the parent step for a loop, use one following methods

| Step type                           | Function                     | Arguments                             |
| ----------------------------------- | ---------------------------- | ------------------------------------- |
| Loop: For each embedded Page        | Activity.forEachEmbeddedPage | (activityName, stepPage)              |
| Loop: For Loop (single iteration)   | Activity.whenBlock           | (transformName, parameters, stepPage) |
| When (if false, skip step)          | Activity.when                | (stepPage)                            |
| When (if false, exit iteration)     | Activity.when                | (stepPage)                            |
| When (if false, jump to later step) | Activity.when                | (stepPage)                            |

:::danger

:::

For more information on configuring client store to support database interactions, see XXX.

### Expressions

When building expressions, literal values and references to properties can be written as they are in activity rules, except that property references must explicitly name the page (a reference leading with a period is not valid in JavaScript). If recommended naming of parameters is followed, "Primary" may be used to refer to the primary page of the data transform, and "myStepPage" can be used to refer to the page from the current context.

To call when rules, call functions, or reference data pages, a different syntax is required. (TBD)

:::tip

To ensure the script is as consistent as possible with the online rule, consider using explicit page references such as Primary and myStepPage when properties are referenced, and use expressions with syntax mimicking JavaScript.

For example, the expression `.EquipmentID = "foo"` would be a valid when expression in a rule, but is not valid JavaScript syntax. The expression `myStepPage.Equipment == "foo"` is valid for both, and allows for easier comparison between the rule and function.

:::

### Async execution

When calling a data page, function rule, or when rule as part of an expression, the corresponding JavaScript function may be asynchronous. If it is necessary to await execution, then the data transform function must be written as asynchronous.

When called from a flow action or UI action, the EPOC platform will automatically await execution of the activity function before rendering the UI. When called from a function or another activity, the function must also be awaited inside of the rule which calls it, which also must be configured as async.

When an async call is made inside of nested steps, it is generally necessary to add awaits and asyncs all the way up the tree. For example, if step 1.1.1 uses async inside an expression, then

:::tip

It is a good practice to configure activity rules to reference data pages and functions in as few places as possible. Instead of referring to the same data page more than once, it could be referenced one time to copy the needed data to parameters or top-level pages, and then used from there. This will simplify the scripting.

:::

## Implementing methods

:::danger

everything in this section

:::

### Pseudo-Methods

#### For: Each Embedded Page

#### For: Single iteration For Loop

#### Jump to later step: breaking loop

#### Jump to later step: error handling

### Call

### Apply-DataTransform

### Exit-Activity

### Obj-Browse

### Obj-Delete

### Obj-Filter

### Obj-Open

### Obj-Open-By-Handle \*

### Obj-Save

### Obj-Save-Cancel \*

### Obj-Sort

### Obj-Validate

### Page-Clear-Messages

### Page-Copy

### Page-Merge-Into

### Page-New

### Page-Remove

### Page-Rename \*

### Page-Set-Messages \*

### Property-Map-DecisionTable \*

### Property-Map-DecisionTree \*

### Property-Remove

### Property-Set

### RDB-Delete

### RDB-List

### RDB-Open

### RDB-Save

### Rollback \*

### Set

```javascript
Method.set(target, value);
```

#### Parameters

`target`

Represents the Target configured in the rule form. Accepts the following types:

- ClipboardReference of a top-level page, embedded page, or single-value property.
- PageList
- ParameterValue

`source`

Represents the Source configured in the rule form. Accepts the following types:

- ClipboardReference of a top-level page, embedded page, or single-value property.
- PageList
- ParameterValue
- string
- number
- boolean

:::warning

When `target` and `source` are both ClipboardReferences corresponding to top-level pages or embedded pages, the two pages must be of the same class. Unlike Pega platform, EPOC currently cannot change the class of a page by assigning a new source to it.

:::

#### Example

```javascript
static setExample(Primary, myStepPage, Param) {
  const OtherPage = new ClipboardReference("OtherPage");

  //assign a literal value to a ClipboardReference of single-value property
  Transform.set(Primary.pyLabel, "foo");

  //assign a ClipboardReference to another Clipboard Reference
  Transform.set(Primary.pyStatusWork, OtherPage.pyNote);

  //copy a top-level page to an embedded page
  Transform.set(Primary.embeddedPageProp, OtherPage);

  //set a parameter value
  Transform.set(Param.Note, OtherPage.pyNote);
}
```

### Remove

```javascript
Method.remove(target);
```

#### Parameters

`target`

Represents the Target configured in the rule form. Accepts the following types:

- ClipboardReference of a top-level page, embedded page, or single-value property.
- PageList
- ParameterValue

#### Example

```javascript
static removeExample(Primary, myStepPage, Param) {
  const OtherPage = new ClipboardReference("OtherPage");

  //remove a property from a page
  Transform.remove(Primary.pyLabel);

  //remove a top-level page
  Transform.remove(OtherPage);

  //remove a parameter value
  Transform.set(Param.Note);
}
```

### Update Page

```javascript
Method.updatePage(target, source, content);
```

#### Parameters

`target`

Represents the Target configured in the rule form. Must be a ClipboardReference corresponding a top-level page or embedded page.

`content`

A function representing all of the steps nested under the Update Page step. `target` will be passed as the first argument to this function.

If the content function is async, then `Transform.updatePage` should be awaited.

:::tip

Use `myStepPage` for the first parameter of the `content` function to allow for steps to be configured consistently with the rule form.

:::

:::warning

EPOC does not support Update Page with a Relation of "with values from" and a Source. If a source page is used, that page must be explicitly referenced within the content function. For consistency, consider configuring the rule to avoid this configuration.

:::

#### Example

```javascript
static async updatePageExample(Primary, myStepPage, Param) {
  const OtherPage = new ClipboardReference("OtherPage");

  //updating an embedded page
  Transform.updatePage(Primary.Owner, (myStepPage) => {
    Transform.set(myStepPage.FirstName, OtherPage.FirstName);
  });

  //updating a top level page, with two child steps
  Transform.updatePage(OtherPage, (myStepPage) => {
    Transform.set(myStepPage.FirstName, "foo");
    Transform.set(myStepPage.LastName, "bar");
  });

  //calling an async content function
  await Transform.updatePage(OtherPage, async (myStepPage) => {
    Transform.set(myStepPage.FirstName, await Rule.function.somethingAsync());
  });
}
```

### Apply Data Transform

```javascript
Method.applyDataTransform(target, params);
```

#### Parameters

`target`

The name of the data transform to run, as a string.

`params` (optional)

Either:

- Object containing parameter values to pass to the data transform. The object's keys correspond to parameter names.
- ParameterPage, to mimic behavior of "Pass Current Paramter Page?" configuration.

If empty, the data transform will be called with no parameters passed.

:::note

EPOC will determine the page on which to run the data transform, based on where this step is placed in the hierarchy.

:::

#### Example

```javascript
static applyDataTransformExample(Primary, myStepPage, Param) {
  const OtherPage = new ClipboardReference("OtherPage");

  //running transform on Primary page
  Transform.applyDataTransform("addPerson");

  //running transform and passing current parameter page
  Transform.applyDataTransform("addPerson", Param);

  //running transform with parameter values explicitly passed
  Transform.applyDataTransform("addPerson", {FirstName: "Sam", LastName: Primary.LastName});

  //running transform on another page.
  Transform.updatePage(OtherPage, (myStepPage) => {
    Transform.applyDataTransform("pyDefault");
  })
}
```

### Sort

```javascript
Method.sort(target, sortProperties);
```

#### Parameters

`target`

PageList to sort.

`sortProperties`

Array of Arrays, each defining one property to be sorted on. The inner array should contain 1 or 2 strings. The first string is the name of the property to sort on. The second string (optional) indicates "ASC" (default) or "DESC" for ascending or descending.

:::warning

EPOC currently allows sorting on single value properties that are directly on the pages of the page list. Properties embedded in pages further down cannot be used for sort.

:::

#### Example

```javascript
static sortExample(Primary, myStepPage, Param) {

  //sort a pagelist, using two sort criteria
  Transform.sort(Primary.myPageList, [["myString", "ASC"], ["myNumber", "DESC"]]);

  //sort a pagelist, using default ordering (ascending)
  Transform.sort(Primary.myPageList, [["myString""]]);
}
```

### Comment

```javascript
Method.comment(text);
```

#### Parameters

`text`

String matching the comment text entered in the rule form.

:::note

This method does not do anything. It is meant only to capture comments that exist in the rule form so that the order and structure of steps is consistent.

:::

#### Example

```javascript
static commentExample(Primary, myStepPage, Param) {

  //comment which does not do anything
  Transform.comment("Stub data transform to be extended in parent classes.");
}
```

### When

```javascript
Method.when(condition, content);
```

#### Parameters

`condition`

If set to true, the content function will be called. If set to false, it will not. If the value is a string, the when rule of that name will be executed.

If the when rule requires async execution, then Transform.when should be awaited. The content function will not execute or skip until the when rule resolves.

`content`

A function representing all of the steps nested under the Update Page step.

If the content function is async, or `condition` references a When rule which is async, then Transform.when should be awaited.

#### Example

```javascript
static async whenExample(Primary, myStepPage, Param) {

  //with a boolean expression evaluating the false
  Transform.set(Primary.pyLabel, "foo");
  Transform.when(Primary.pyLabel == "bar", () => {
    Transform.comment("This step will not run.");
  });

  //with a boolean expression evaluating to true
  Transform.when(Primary.pyLabel == "foo", () => {
    Transform.comment("This step will run.");
  })

  //with a when rule
  Transform.when("Resolved", () => {
    Transform.comment("This step will run if the when rule Resolved evaluates to true.");
  })

  //with an async when rule
  await Transform.when("HasOtherCase", () => {
    Transform.comment("This step will run if the when rule HasOtherCase evaluates to true, but it will not execute until the When rule's promise resolves.");
  })

  //with an async content function
  await Transform.when(true, async () => {
    await Transform.set(Primary.FirstName, await Rule.function.somethingAsync());
  })

}
```

### Otherwise When

```javascript
Method.otherwiseWhen(condition, content);
```

:::warning

To function as expected, this must be directly preceded by a `Method.when` or another `Method.otherwiseWhen` step

:::

#### Parameters

`condition`

Same usage as `condition` for `Method.when`. However this step also requires that the preceding `Method.when` step and all `Method.otherwiseWhen` steps between these two all had conditions evaluate to false.

`content`

A function representing all of the steps nested under the Update Page step.

If the content function is async, or `condition` references a When rule which is async, then Transform.otherwiseWhen should be awaited.

#### Example

```javascript
static async otherwiseWhenExample(Primary, myStepPage, Param) {

  //skipping execution when the previous when was true
  Transform.when(true, () => {
    Transform.comment("This step will run.");
  });
  Transform.otherwiseWhen(true, () => {
    Transform.comment("This step will not run. Although the condition is true, the previous when rule was true.");
  });

  //skipping execution when the previous when was false but another otherwise When was ture
  Transform.when(false, () => {
    Transform.comment("This step will not run.");
  });
  Transform.otherwiseWhen(true, () => {
    Transform.comment("This step will run.");
  });
  Transform.otherwiseWhen(false, () => {
    Transform.comment("This step not run, because the previous otherwiseWhen step did run.");
  });

  //with a when rule
  Transform.when(false, () => {
    Transform.comment("This step will not run.")
  });
  Transform.otherwiseWhen("Resolved", () => {
    Transform.comment("This step will run if the when rule Resolved evaluates to true.")
  });

  //with an async when rule
  Transform.when(false, () => {
    Transform.comment("This step will not run.")
  });
  await Transform.otherwiseWhen("HasOtherCase", () => {
    Transform.comment("This step will run if the when rule HasOtherCase evaluates to true, but it will not execute until the When rule's promise resolves.")
  })

  //with an async content function
  Transform.when(false, () => {
    Transform.comment("This step will not run.")
  });
  await Transform.otherwiseWhen(true, async () => {
    await Transform.set(Primary.FirstName, await Rule.function.somethingAsync());
  })

}
```

### Otherwise

```javascript
Method.otherwise(content);
```

:::warning

To function as expected, this must be directly preceded by a `Method.when` or `Method.otherwiseWhen` step

:::

#### Parameters

`content`

A function representing all of the steps nested under the Update Page step. The content function will be executed only if the preceding `Method.when` step and all `Method.otherwiseWhen` steps between these two all had conditions evaluate to false.

If the content function is async, then Transform.otherwise should be awaited.

#### Example

```javascript
static async otherwiseExample(Primary, myStepPage, Param) {

  //skipping execution when the previous when was true
  Transform.when(true, () => {
    Transform.comment("This step will run.");
  });
  Transform.otherwise(() => {
    Transform.comment("This step will not run because the previous when was true");
  });

  //skipping execution when the previous when was false but another otherwise When was ture
  Transform.when(false, () => {
    Transform.comment("This step will not run.");
  });
  Transform.otherwiseWhen(true, () => {
    Transform.comment("This step will run.");
  });
  Transform.otherwise(() => {
    Transform.comment("This step not run, because the previous otherwiseWhen step did run.");
  });

  //successful run
  Transform.when(false, () => {
    Transform.comment("This step will not run.")
  });
  Transform.otherwiseWhen(false, () => {
    Transform.comment("This step will not run.")
  });
  Transform.otherwise(() => {
    Transform.comment("This step will run.")
  });

  //with an async content function
  Transform.when(false, () => {
    Transform.comment("This step will not run.")
  });
  await Transform.otherwise(async () => {
    await Transform.set(Primary.FirstName, await Rule.function.somethingAsync());
  })

}
```

### Append to

```javascript
Method.appendTo(target, source);
```

#### Parameters

`target`

A PageList to which a page will be added. If this references a property that is missing, it will initialize an array of length 1.

`source` (optional)

The Relation configuration will be inferred from this value. If `source` is missing, this is equivalent to "a new page". If `source` is a ClipboardReference, this is equivalent to "an existing page". If `source` is a PageList, this is equivalent to "each page in".

:::tip

There is no script equivalent for "current source page" relation. It is suggested that these steps be modified to use "an existing page" with myStepPage as the source.

:::

#### Example

```javascript
static appendToExample(Primary, myStepPage, Param) {
  const CurrentOperation = new ClipboardReference("CurrentOperation");

  //appending an empty page
  Transform.appendTo(Primary.OperationsList);

  //appending an existing page
  Transform.appendTo(Primary.OperationsList, CurrentOperation);

  //appending a PageList
  Transform.appendTo(Primary.OperationsList, Primary.NewOperationsList);

}
```

### Append and Map to

```javascript
Method.appendAndMapTo(target, source, content);
```

#### Parameters

`target`

A PageList to which a page will be added. If this references a property that is missing, it will initialize an array of length 1.

`source` (optional)

The Relation configuration will be inferred from this value. If `source` is missing, this is equivalent to "a new page". If `source` is a ClipboardReference, this is equivalent to "an existing page". If `source` is a PageList, this is equivalent to "each page in".

:::tip

There is no script equivalent for "current source page" relation. It is suggested that these steps be modified to use "an existing page" with myStepPage as the source.

:::

`content`

A function representing all of the steps nested under the Append and Map To step. The first argument will be a ClipboardReference representing the page which was appended. The second argument will be a ClipboardReference representing the source ClipboardReference, or representing the page of the source PageList being looped over.

If `source` was a PageList, then the content function will be called once for each page that gets appended.

If the content function is async, then Transform.appendAndMapTo should be awaited.

:::warning

In the rule form, the child steps will resolve `myStepPage` differently based on whether it is referenced in the source or target column. This is not possible in JavaScript, so the source page must be bound to a different parameter. It is recommended to use "mySourcePage". The scripted version will differ from the rule form in this way, but it is unavoidable.

:::

#### Example

```javascript
static async appendAndMapToExample(Primary, myStepPage, Param) {
  const CurrentOperation = new ClipboardReference("CurrentOperation");

  //append an empty page and then set pyLabel on the newly appended page
  Transform.appendAndMapTo(Primary.OperationsList, "", (myStepPage) => {
    Transform.set(myStepPage.pyLabel, "foo");
  });

  //append an existing page and copy values
  Transform.appendAndMapTo(Primary.OperationsList, CurrentOperation, (myStepPage) => {
    Transform.set(myStepPage.pyLabel, CurrentOperation.pyLabel);
  });

  //appending a PageList
  Transform.appendAndMapTo(Primary.OperationsList, Primary.NewOperationsList, (myStepPage, mySourcePage) => {
    Transform.set(myStepPage.pyLabel, mySourcePage.pyLabel);
  });

  //appending a PageList with async function
  await Transform.appendAndMapTo(Primary.OperationsList, Primary.NewOperationsList, async (myStepPage, mySourcePage) => {
    Transform.set(myStepPage.pyLabel, await Rule.function.somethingAsync(mySourcePage.pyLabel));
  });

}
```

### For Each Page In

```javascript
Method.forEachPageIn(target, content);
```

#### Parameters

`target`

A PageList to iterate over.

`content`

A function representing all of the steps nested under the For Each Page In step. The first argument will be a ClipboardReference representing the page for the current iteration.

If the content function is async, then Transform.updatePage should be awaited.

#### Example

```javascript
static async forEachPageInExample(Primary, myStepPage, Param) {

  //iterating a page list to set a property
  Transform.forEachPageIn(Primary.OperationsList, (myStepPage) => {
    Transform.set(myStepPage.pyLabel, 'foo');
  });

  //iterating a page list and applying an async function
  await Transform.forEachPageIn(Primary.OperationsList, async (myStepPage) => {
    Transform.set(myStepPage.pyLabel, await Rule.function.somethingAsync('foo'));
  });

}
```

### Exit For Each

```javascript
Method.exitForEach();
```

Exits the currently running `Method.forEachPageIn`, without running any subsequent steps in the current iteration nor any future iterations. If embedded in multiple `Method.forEachPageIn`, only the closest one up the stack is aborted.

#### Example

```javascript
static async exitForEachExample(Primary, myStepPage, Param) {

  //iterating a page list to set a property, and aborting if a value is true
  Transform.forEachPageIn(Primary.OperationsList, (myStepPage) => {
    Transform.set(myStepPage.pyLabel, 'foo');
    Transform.when("IsInactive", () => {
        Transform.exitForEach();
    })
  });

}
```

### Exit Data Transform

```javascript
Method.exitDataTransform();
```

Exits the currently running data transform, regardless of how many nested steps are in between.

:::warning

This works by throwing a specific error, which is caught and handled by the platform when the data transform is called a platform method. If the function is manually invoked for any other reason, the error must be handled, although manually invoking the data transform function directly is not a good practice.

:::

#### Example

```javascript
static async exitDataTransformExample(Primary, myStepPage, Param) {

  //exiting a data transform
  Transform.comment("This step will execute.");
  Transform.when(true, () => {
    Transform.exitDataTransform();
  });
  Transform.comment("This step will not execute.");
}
```

## Backlog

The following items may be enhanced in future releases:

1. Method to auto-generate EPOC compliant functions.
2. Support for "Call superclass transform".
3. Support for data transforms called from flows (support is unlikely)
4. Allow changing of page classes during Set.
5. Allow sorting pagelists on properties of embedded pages.
6. Append and Map To needs two arguments passed to the content function. Do the same for Update Page.
