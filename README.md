# Easy Web Forms

## Introduction

Easy Web Forms is a PHP library that simplifies building modern, web-based forms. The library creates the form's HTML and processes user submissions. On success, the results are displayed as HTML and stored in a MySQL database. Both client- and server-side validation are built-in and straightforward to configure.

[Demo](https://shaefner-usgs.github.io/easy-web-forms/demo.html)

## Requirements

PHP and MySQL are required on the web server that hosts your form.

## Getting Started

If you just want to use this library to create a web-based form, all the necessary files are located in the 'dist' folder. See below for instructions on building/compiling from source if you want to make modifications to the library.

1. **Include** the PHP, CSS and JavaScript dependencies in a new PHP document in htdocs:

    ```php
    include_once '../lib/index.inc.php';
    ```

    Include this line first before any other content on the web page. Be certain to set configuration parameters for your environment in conf/config.inc.php.

    ```html
    <link rel="stylesheet" href="css/index.css" />
    <script src="js/index.js"></script>
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

3. **Add** the form controls:

    ```php
    $form = new Form(); // instantiate Form instance

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

See [example.php](src/htdocs/example.php) for additional details.

### MySQL

Create a MySQL table on the server with field names that correspond to the name attribute of each form control/group you add. Additional fields are needed to store optional [metadata](#options) for each record if you enable metadata:

* datetime (Type DATETIME)
* ip (Type VARCHAR)
* browser (Type VARCHAR)

No metadata fields are included by default. Adding an auto-incrementing 'id' field is recommended.

It is recommended to set the MySQL encoding to utf8mb4 for the database, table and fields to accommodate all characters and symbols.

## Building/Compiling

If you want to make modifications to the library, you will need to build/compile your changes.

1. **Install** dependencies and **start** the build process and development web server:

    `npm install`

    `php composer.phar install`

    `grunt`

    Preview files in src/htdocs at http://localhost:9200/. While grunt is running, live reload automatically runs the build process and refreshes your browser when you save changes.

2. **Compile** the CSS and JavaScript:

    `grunt dist`

    This updates files in the 'dist' folder with your changes. Preview files in dist/htdocs at http://localhost:9201/.

### Dependencies

1. [Grunt](https://gruntjs.com/)
2. [Node.js](https://nodejs.org/), [NPM](https://www.npmjs.com/)
3. [Composer](https://getcomposer.org/)
4. PHP with CGI

<a id="validation"></a>
## Validation

Both client- and server-side validation are performed automatically, based on standard [HTML5 attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/text#Additional_attributes) that you set when creating [form controls](#form-controls). The attributes that trigger validation are:

* maxwidth - `<input>` types that support this attribute, `<textarea>`
* minwidth - `<input>` types that support this attribute, `<textarea>`
* pattern - `<input>` types that have string values
* required - `<input>`, `<textarea>`, `<select>`

In addition, the following `<input>` types have automatic pattern matching built-in, using a simple RegExp to validate user input:

* datetime [(custom type)](#custom-types)
* email
* number
* url

To override built-in pattern matching, set a custom 'pattern' attribute when you create an `<input>`.

## Inline Content

To render additional HTML content associated with a form control next to the control, include the ancillary content inside a `<div>` with the class 'form-meta' and set the ancillary content's class to the 'name' value of the form control. For example:

```html
<div class="form-meta">
  <img class="nameValue" src="image.jpg" />
</div>
```

This also works for adding inline content to the results following form submission. The content is moved into place (via javascript) when the form/results are rendered. Note: Form's [isPosting()](#is-posting) and [isValid()](#is-valid) methods might be useful for controlling when the content is displayed.

## Security

All user-supplied input is sanitized using PHP [Data Filtering](https://www.php.net/manual/en/book.filter.php) and prepared statements are used to prevent SQL injection vulnerabilities.

## API Documentation

### Form

Used to create an HTML `<form>`. Back-end routines process and post the form data into the MySQL table you provided in conf/config.inc.php or during Form instantiation.

#### Usage example

```php
$form = new Form([
    'successMsg' => 'Thanks for your order.',
    'table' => 'tableName'
]);
```

#### Creation

| Factory | Description |
| ------ | ------ |
| Form(options?) | Instantiates a new Form given an optional options Array. |

<a id="options"></a>
#### Options

| Option | Type | Default | Description |
| ------ | ------ | ------ | ------ |
| adminEmail | String | '' | If supplied, the email address where a summary of user-entered data is sent when the form is submitted successfully. Comma separate multiple addresses. |
| emailSubject | String | 'Form submitted' | Subject of form submission email notification sent to admin. Use [mustache templates](https://mustache.github.io) to include form field data entered by user. **Example**: Form submitted by {{fname}} {{lname}}, where 'fname' and 'lname' are the name attribute values of the form fields. |
| emailTemplate | String | '' | Full path to a file containing an email template with a {{content}} placeholder where submitted results will be inserted. |
| meta | Array | ['browser' => false, 'datetime' => false, 'ip' => false] | Associative array of metadata fields to include in each database record. None are included by default. |
| mode | String | 'insert' | SQL mode: 'insert' or 'update'. |
| record | Array | [] | Associative array containing details of the record to update. The array key is the SQL field's name, typically an 'id'; the array value is the corresponding field's unique value. The 'mode' option must be set to 'update'. |
| submitButtonText | String | 'Submit' | Submit button's text value. |
| successMsg | String | 'Thank you for your input.' | Message shown to user upon successful form submission. |
| table | String | '' | Name of MySQL table to insert records into. Overrides table name supplied in conf/config.inc.php |

#### Methods

| Method | Returns | Description |
| ------ | ------ | ------ |
| addControl([`<Control>`](#form-controls) control) | null | Adds the given control to the form. Form controls are rendered in the order added. |
| addGroup([`<addGroup options>`](#addGroup-options) options) | null | Adds the given radio/checkbox group of controls to the form. Form controls are rendered/processed in the order added. |
| <a id="is-posting"></a>isPosting() | Boolean | Checks if the form is being submitted. |
| <a id="is-valid"></a>isValid() | Boolean | Checks if the form passed server-side validation after submitting. |
| render() | null | Displays either the form or the results if submitting. |

<a id="addGroup-options"></a>
#### addGroup options

| Option | Type | Default | Description |
| ------ | ------ | ------ | ------ |
| arrangement | String | 'inline' | Form control (radio/checkbox) layout: 'inline' or 'stacked'. |
| **controls** | Array | [] | Indexed array of [`<Control>`](#form-controls)s. |
| description | String | '' | Explanatory text displayed next to the form control group. |
| label | String | 'name' attribute value of [`<Control>`](#form-controls)s in group. | `<legend>` for `<fieldset>` group. |
| message | String | '' | Message shown when one or more form controls in a group are invalid. |
| separator | String | ', ' | String used to separate user-selected options from a checkbox group in the summary results. |
| validate | String | 'all' | Validation scope for a required checkbox group: 'some' or 'all'. |

Options in **bold** are required.

<a id="form-controls"></a>
### Input

Used to create an HTML `<input>`.

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
| Input(options) | Instantiates a new HTML `<input>` control given an options Array. |

<a id="flatpickr"></a>
#### Options

| Option | Type | Default | Description |
| ------ | ------ | ------ | ------ |
| accept | String | 'image/png, image/jpeg' | `<input>` accept attribute. |
| checked | Boolean | false | `<input>` checked attribute. |
| class | String | '' | CSS class attached to the form control's parent `<div>`. |
| description | String | '' | Explanatory text displayed next to the form control. Automatically set to the number of chars. required if minlength/maxlength are set and this option has not been set. |
| disabled | Boolean | false | `<input>` disabled attribute. |
| fpOpts | Array | [] | [flatpickr options](https://flatpickr.js.org/options/). Key/value pairs to configure datepicker widget for 'datetime' type `<input>` controls. |
| *id* | String | value of 'name' option | `<input>` id attribute. |
| inputmode | String | '' | `<input>` inputmode attribute. |
| label | String | '' | `<label>` for `<input>`. If provided, the value is displayed above the form control/group. Otherwise, the value of the name attribute is displayed. |
| max | Integer | null | `<input>` max attribute. |
| maxlength | Integer | null | `<input>` maxlength attribute. |
| message | String | 'Please provide a valid {{label}}' | Message shown when the form control is invalid. Use [mustache templates](https://mustache.github.io) to insert the control's `<label>` or `<name>` into the message. If you set minlength/maxlength values and you haven't set a custom message, a note will be automatically appended to the default message explaining this requirement. |
| min | Integer | null | `<input>` min attribute. |
| minlength | Integer | null | `<input>` minlength attribute. |
| **name** | String | '' | `<input>` name attribute. |
| path | String | '' | Full (absolute) path to the file upload directory on the server for 'file' type `<input>` controls (a trailing slash is optional). If this option omitted, the uploaded file will not be saved. |
| pattern | RegExp | '' | `<input>` pattern attribute. **Note:** Do not include delimiters around the pattern text. |
| placeholder | String | '' | `<input>` placeholder attribute. |
| readonly | Boolean | false | `<input>` readonly attribute. |
| required | Boolean | false | `<input>` required attribute. |
| type | String | 'text' | `<input>` type attribute. |
| *value* | String | '' | `<input>` value attribute. |

Options in **bold** are required; options in *italics* are required for all radio/checkbox controls.

#### Special Types

All [standard `<input>` types](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Form_<input>_types) are supported (*except* **image**).

Some types have added functionality:

* **checkbox**

  The default 'message' option is set to 'Please select one or more options'.

* **email**

  User input is automatically validated using simple pattern matching. You can override this by setting the 'pattern' option to a custom value.

* **file**

  If the 'path' option is set, the file will be uploaded to the given path and renamed using a timestamp and the original file extension (to ensure all uploaded files have a unique name). The new filename is stored in the database. If the user selects an image, a preview will be rendered inline next to the form control. The default 'description' option is set to '.jpg or .png'. The default 'message' option is set to 'Please choose a file'. Set the 'accept' option to allow file types other than .jpg and .png. 
  
  If necessary, you can further process uploaded files in the calling PHP script **after** rendering the form:

  ```php
  $form->render();
  ...
  if ($form->isPosting() && $form->isValid()) {
    // Handle uploaded file(s) here
  }
  ```

* **number**

  User input is automatically validated using simple pattern matching. You can override this by setting the 'pattern' option to a custom value.

* **radio**

  The default 'message' option is set to 'Please select an option'.

* **url**

  User input is automatically validated using simple pattern matching. You can override this by setting the 'pattern' option to a custom value. The default 'description' option is set to 'Include “http://” or “https://”'.

<a id="custom-types"></a>
In addition, the following non-standard **custom types** are also supported:

* **address**

  Creates a single field for entering a street address with autocomplete suggestions as you type. You will need to create the following extra fields in the database table to store the constituent values, which are set in hidden `<input>` fields on the web page: 'city', 'countryCode', 'latlng', 'postalCode', 'state', 'street'. This functionality utilizes a 3rd-party library called [PlaceSearch.js](https://developer.mapquest.com/documentation/place-search-js/v1.0/), and it requires a [MapQuest API key](https://developer.mapquest.com), which you set in conf/config.inc.php.

* **datetime**

  Creates a datetime (or date/time only) field with a datepicker calendar widget for simplifying/ensuring valid user input. This functionality utilizes a 3rd-party library called [flatpickr](https://flatpickr.js.org). See the [flatpickr documentation](https://flatpickr.js.org/options/) for details on setting configuration options for the datepicker. All flatpickr options are supported, and you configure them by setting '[fpOpts](#flatpickr)'. Javascript expressions such as `function()`s and `new Date()`s need to be passed as strings, and they will be parsed into javascript expressions when the page is rendered.

  User input is automatically validated using formats that conform to MySQL Types DATE, DATETIME, or TIME, depending on how you configure the datepicker. If you override the default format, you will need to set a custom 'pattern' attribute for validating.

#### Special Attributes

The following `<input>` attributes will trigger [validation](#validation) when set:

* maxwidth
* minwidth
* pattern
* required

### Select

Used to create an HTML `<select>`.

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
| Select(options) | Instantiates a new HTML `<select>` control given an options Array. |

#### Options

| Option | Type | Default | Description |
| ------ | ------ | ------ | ------ |
| class | String | '' | CSS class attached to the form control's parent `<div>`. |
| description | String | '' | Explanatory text displayed next to the form control. |
| disabled | Boolean | false | `<select>` disabled attribute. |
| id | String | value of 'name' option | `<select>` id attribute. |
| label | String | '' | `<label>` for `<select>`. If provided, the value is displayed above the form control. Otherwise, the value of the name attribute is displayed. |
| message | String | 'Please select an option from the menu' | Message shown when the form control is invalid. |
| **name** | String | '' | `<select>` name attribute. |
| **options** | Array | [] | Associative array of choices in the select menu. The array key is the data value sent to the server when that option is selected; the array value is the text that is shown in each of the menu choices. |
| required | Boolean | false | `<select>` required attribute. |
| selected | String | '' | `<option>` selected attribute. Set the value to the array key of the option to be selected by default when page loads. |

Options in **bold** are required.

#### Special Attributes

The following `<select>` attribute will trigger [validation](#validation) when set:

* required

### Textarea

Used to create an HTML `<textarea>`.

#### Usage example

```php
$name = new Textarea([
    'name' => 'comments'
]);
```

#### Creation

| Factory | Description |
| ------ | ------ |
| Textarea(options) | Instantiates a new HTML `<textarea>` control given an options Array. |

#### Options

| Option | Type | Default | Description |
| ------ | ------ | ------ | ------ |
| class | String | '' | CSS class attached to the form control's parent `<div>`. |
| cols | Integer | null | `<textarea>` cols attribute. |
| description | String | '' | Explanatory text displayed next to the form control. Automatically set to number of chars. required if minlength/maxlength is set and this option has not been set. |
| disabled | Boolean | false | `<textarea>` disabled attribute. |
| id | String | value of 'name' option | `<textarea>` id attribute. |
| label | String | '' | `<label>` for `<textarea>`. If provided, the value is displayed above the form control. Otherwise, the value of the name attribute is displayed. |
| maxlength | Integer | null | `<textarea>` maxlength attribute. |
| minlength | Integer | null | `<textarea>` minlength attribute. |
| message | String | 'Please provide a valid response' | Message shown when the form control is invalid. If you set minlength/maxlength values, and you haven't set a custom message, a note will be automatically appended to the default message explaining this requirement. |
| **name** | String | '' | `<textarea>` name attribute. |
| placeholder | String | '' | `<textarea>` placeholder attribute. |
| required | Boolean | false | `<textarea>` required attribute. |
| rows | Integer | 4 | `<textarea>` rows attribute. |
| value | String | '' | Initial `<textarea>` value. |

Options in **bold** are required.

#### Special Attributes

The following `<textarea>` attributes will trigger [validation](#validation) when set:

* maxwidth
* minwidth
* required

## Acknowledgements

[pretty-checkbox.css](https://github.com/lokesh-coder/pretty-checkbox) and code inspired by [Bootstrap](https://github.com/twbs/bootstrap) are used to enhance the user interface of form elements. [autop](https://ma.tt/scripts/autop/) preserves formatting of line breaks for `<textarea>` fields in the results summary. This library also uses cloud-hosted versions of 1) [MapQuest PlaceSearch.js](https://developer.mapquest.com/documentation/place-search-js/v1.0/) for single field 'address' type `<input>` controls and 2) [flatpickr](https://flatpickr.js.org) for 'datetime' type `<input>` controls.
