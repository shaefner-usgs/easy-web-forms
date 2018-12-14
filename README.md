# Easy Web Forms

## Introduction

Easy web forms is a PHP library that simplifies the process of creating web-based forms. The library creates the HTML for the form, processes it, and stores results in a MySQL database. Both client- and server-side validation are built-in and straightforward to configure.

[Demo](https://shaefner-usgs.github.io/easy-web-forms/demo.html)

## Requirements

PHP and MySQL

## Getting Started

1. **Include** the php dependencies, configuration file (be sure to set the configuration parameters for your environment in conf/config.inc.php), css, and javascript:

    ```php
    include_once 'lib/functions.inc.php';
    include_once 'lib/classes.inc.php';
    include_once 'conf/config.inc.php';
    ```
    ```html
    <link rel="stylesheet" href="css/styles.css" />
    <script src="js/script.js"></script>
    ```

2. **Create** the form controls. For example:

    ```php
    $name = new Input([
        'label' => 'Full Name'
        'name' => 'name',
        'required' => true // sets up validation for this control
    ]);

    $male = new Input([
        'name' => 'gender',
        'id' => 'male',
        'required' => true,
        'type' => 'radio',
        'value' => 'male'
    ]);
    $female = new Input([
        'name' => 'gender',
        'id' => 'female',
        'required' => true,
        'type' => 'radio',
        'value' => 'female'
    ]);
    ```

3. **Add** the form controls to Form:

    ```php
    $form = new Form(); // initialize Form instance

    $form->addControl($name);
    $form->addGroup([
        controls => [
            $male,
            $female
        ],
        label => 'Gender'
    ]);
    ```

4. **Render** the form:

    ```php
    $form->render();
    ```

See [example.php](dist/example.php) for additional details.

You will also need to create a MySQL table with field names that correspond to the name attribute of each form control/group. Additional fields are needed to store metadata for each record: 'datetime' (Type DATETIME), 'ip' (Type VARCHAR) and browser (Type VARCHAR). All metadata fields are optional, but 'datetime' is set to be included by default. An auto-incrementing 'id' field is recommended.

# Documentation

### Form

Used to create an HTML `<form>` including the back-end PHP routines to process and post the form data in MySQL.

#### Usage example

```php
$form = new Form([
    'successMsg' => 'Thanks for your order.'
]);
```

#### Creation

| Factory | Description |
| ------ | ------ |
| Form(options?) | Instantiates a new html form given an optional options Array |

#### Options

| Option | Type | Default | Description |
| ------ | ------ | ------ | ------ |
| adminEmail | String | '' | If supplied, the email address where a summary of user-entered data is sent when the form is submitted successfully. Comma separate multiple addresses if desired. |
| emailSubject | String | 'Form submitted' | Subject of form submission email notification. Use [mustache templates](https://mustache.github.io) to include form field data entered by user. **Example**: Form submitted by {{fname}} {{lname}}, where 'fname' and 'lname' are the name attribute values of the form fields. |
| meta | Array | ['browser' => false, 'datetime' => true, 'ip' => false] | Associative array that dictates which metadata fields to include with each database record. |
| submitButtonText | String | 'Submit' | Submit button text |
| successMsg | String | 'Thank you for your input.' | Message shown to user upon successful form submission. |

#### Methods

| Method | Returns | Description |
| ------ | ------ | ------ |
| addControl([`<Control>`](#form-controls) control) | null | Adds the given control to the form. Form controls are rendered in the order added. |
| addGroup([`<addGroup options>`](#addGroup-options) options) | null | Adds the given radio/checkbox group of controls to the form. Form controls are rendered in the order added. |
| isPosting() | Boolean | Checks if form is being posted. |
| isValid() | Boolean | Checks if form passed server-side validation. |
| render() | null | Displays either the web form or the results after submitting. |

#### addGroup options

| Option | Type | Default | Description |
| ------ | ------ | ------ | ------ |
| arrangement | String | 'inline' | Form control layout: 'inline' or 'stacked'. |
| **controls** | Array | undefined | Indexed array of [`<Control>`](#form-controls)s |
| description | String | '' | Explanatory text displayed next to form control group |
| label | String | 'name' attribute value of [`<Control>`](#form-controls)s in group | `<legend>` for `<fieldset>` group |
| message | String | '' | Message shown when form control(s) in group is(are) invalid. |

Options in **bold** are required.

## Form Controls

### Input

Used to create an html `<input>`.

#### Usage example

```php
$name = new Input([
    'label' => 'Full Name'
    'name' => 'name'
]);
```

#### Creation

| Factory | Description |
| ------ | ------ |
| Input(options) | Instantiates a new html `<input>` control given an options Array |

#### Options

| Option | Type | Default | Description |
| ------ | ------ | ------ | ------ |
| checked | Boolean | false | `<input>` checked attribute |
| class | String | '' | CSS class attached to parent `<div>`. |
| description | String | '' | Explanatory text displayed next to form control. |
| disabled | Boolean | false | `<input>` disabled attribute |
| id * | String | '' | `<input>` id attribute |
| inputmode | String | '' | `<input>` inputmode attribute |
| label | String | '' | `<label>` for `<input>` |
| max | Integer | null | `<input>` max attribute |
| maxlength | Integer | null | `<input>` maxlength attribute |
| message | String | 'Please provide a valid {{label}}' | Message shown when form control is invalid. Use [mustache templates](https://mustache.github.io) to insert control's `<label>` or `<name>` into the message. If you set minlength/maxlength values, and you haven't set a custom message, a note will be appended to message explaining this requirement. |
| min | Integer | null | `<input>` min attribute |
| minlength | Integer | null | `<input>` minlength attribute |
| **name** | String | '' | `<input>` name attribute |
| pattern | RegExp | '' | `<input>` pattern attribute - **Note:** No forward slashes should be specified around the pattern text. |
| placeholder | String | '' | `<input>` placeholder attribute |
| readonly | Boolean | false | `<input>` readonly attribute |
| required | Boolean | false | `<input>` required attribute |
| type | String | 'text' | `<input>` type attribute |
| value * | String | '' | `<input>` value attribute |

Options in **bold** are required; * = required for all radio/checkbox controls.

#### Special Types

All [standard `<input>` types](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Form_<input>_types) are supported (except 'image' and 'file'). Some types have added functionality:

* **checkbox**: the default message option is set to 'Please select one or more options'.
* **email**: user input is automatically validated using simple pattern matching. You can override this by setting the pattern option to a custom value.
* **number**: user input is automatically validated using simple pattern matching. You can override this by setting the pattern option to a custom value.
* **radio**: the default message attribute is set to 'Please select an option'.
* **url**: user input is automatically validated using simple pattern matching. You can override this by setting the pattern option to a custom value. The default description option is set to 'Include “http://” or “https://”'.

In addition, the following non-standard type is also supported:

* **address**: creates a single field for entering a street address with autocomplete suggestions as you type. You will need to create the following extra fields in the database table to store the constituent values, which are temporarily stored in hidden `<input>` fields: 'city', 'countryCode', 'latlng', 'postalCode', 'state', 'street'. This functionality utilizes a 3rd-party library called [PlaceSearch.js](https://developer.mapquest.com/documentation/place-search-js/v1.0/), and it requires a [MapQuest API key](https://developer.mapquest.com), which you set in conf/config.inc.php.

### Select

Used to create an html `<select>`.

#### Usage example

```php
$name = new Select([
    'name' => 'city',
    'options' => [
        '' => 'Select a city'
        'sf' => 'San Francisco',
        'la' => 'Los Angeles'
    ]
]);
```

#### Creation

| Factory | Description |
| ------ | ------ |
| Select(options) | Instantiates a new html `<select>` control given an options Array |

#### Options

| Option | Type | Default | Description |
| ------ | ------ | ------ | ------ |
| class | String | '' | CSS class attached to parent `<div>` |
| description | String | '' | Explanatory text displayed next to form control. |
| disabled | Boolean | false | `<select>` disabled attribute |
| id | String | '' | `<select>` id attribute |
| label | String | '' | `<label>` for `<select>` |
| message | String | 'Please select an option from the menu' | Message shown when form control is invalid. |
| **name** | String | '' | `<select>` name attribute |
| **options** | Array | [] | Associative array of choices in the select menu. The array key is the data value sent to the server when that option is selected; the array value is the text that is shown in each of the menu choices. |
| required | Boolean | false | `<select>` required attribute |
| selected | String | '' | `<option>` selected attribute - set the value to the Array key of the option to be selected by default when page loads. |

Options in **bold** are required.

### Textarea

Used to create an html `<textarea>`.

#### Usage example

```php
$name = new Textarea([
    'name' => 'comments'
]);
```

#### Creation

| Factory | Description |
| ------ | ------ |
| Textarea(options) | Instantiates a new html `<textarea>` control given an options Array |

#### Options

| Option | Type | Default | Description |
| ------ | ------ | ------ | ------ |
| class | String | '' | CSS class attached to parent `<div>` |
| cols | Integer | 60 | `<textarea>` cols attribute |
| description | String | '' | Explanatory text displayed next to form control. |
| disabled | Boolean | false | `<textarea>` disabled attribute |
| id | String | '' | `<textarea>` id attribute |
| label | String | '' | `<label>` for `<textarea>` |
| maxlength | Integer | null | `<textarea>` maxlength attribute |
| minlength | Integer | null | `<textarea>` minlength attribute |
| message | String | 'Please provide a valid response' | Message shown when form control is invalid. If you set minlength/maxlength values, and you haven't set a custom message, a note will be appended to message explaining this requirement. |
| **name** | String | '' | `<textarea>` name attribute |
| placeholder | String | '' | `<textarea>` placeholder attribute |
| required | Boolean | false | `<textarea>` required attribute |
| rows | Integer | 4 | `<textarea>` rows attribute |
| value | String | '' | `<textarea>` value attribute |

Options in **bold** are required.

## Acknowledgements

Portions of [Bootstrap](https://github.com/twbs/bootstrap) and [pretty-checkbox.css](https://github.com/lokesh-coder/pretty-checkbox) are distributed with this library to enhance the user interface. This library also uses a cloud-hosted version of [MapQuest PlaceSearch.js](https://developer.mapquest.com/documentation/place-search-js/v1.0/) for single field `<input>` controls of type 'address'.
