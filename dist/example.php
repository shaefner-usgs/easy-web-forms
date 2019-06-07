<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <link rel="stylesheet" href="css/styles.css" />
    <title>Example</title>
  </head>
  <body>

<?php

// 1. Include php dependencies and configuration
//  (be sure to set MySQL configuration for your environment in conf/config.inc.php)
include_once 'lib/functions.inc.php';
include_once 'lib/classes.inc.php';
include_once 'conf/config.inc.php';

// 2. Create the form controls
$name = new Input([
  'name' => 'name',
  'required' => true,
  'message' => 'NAME is required'
]);
$email = new Input([
  'type' => 'email',
  'label' => 'Email Address',
  'name' => 'email',
  'required' => true
]);
$address = new Input([
  'type' => 'address',
  'label' => 'Delivery Address',
  'name' => 'address',
  'required' => true
]);
$datetime = new Input([
  'type' => 'datetime',
  'label' => 'Delivery Time',
  'name' => 'datetime',
  'flatpickrOptions' => [
    //'allowInput' => true,
    //'altFormat' => 'F j, Y at h:i K',
    //'altInput' => true,
    'dateFormat' => 'Y-m-d H:i:00',
    'defaultHour' => 10,
    'defaultMinute' => 30,
    'enableTime' => true,
    'minDate' => 'today',
    'minuteIncrement' => 15
  ],
  'required' => true
]);
$crust = new Select([
  'name' => 'crust',
  'options' => [
    '' => 'Choose a crust',
    'thin' => 'Thin &amp; Crispy',
    'deep' => 'Chicago Deep Dish',
    'glutenfree' => 'Gluten Free'
  ],
  'required' => true
]);
$mozzarella = new Input([
  'type' => 'radio',
  'name' => 'cheese',
  'id' => 'mozzarella',
  'value' => 'mozzarella',
  'checked' => true
]);
$soy = new Input([
  'type' => 'radio',
  'name' => 'cheese',
  'id' => 'soy',
  'value' => 'soy',
  'label' => 'Soy (vegan)',
  'checked' => false
]);
$sausage = new Input([
  'type' => 'checkbox',
  'name' => 'toppings',
  'id' => 'sausage',
  'value' => 'sausage'
]);
$pepperoni = new Input([
  'type' => 'checkbox',
  'name' => 'toppings',
  'id' => 'pepperoni',
  'value' => 'pepperoni'
]);
$peppers = new Input([
  'type' => 'checkbox',
  'name' => 'toppings',
  'id' => 'peppers',
  'value' => 'peppers',
  'label' => 'Bell peppers'
]);
$tomato = new Input([
  'type' => 'checkbox',
  'name' => 'toppings',
  'id' => 'tomato',
  'value' => 'tomato'
]);
$onion = new Input([
  'type' => 'checkbox',
  'name' => 'toppings',
  'id' => 'onion',
  'value' => 'onion'
]);
$instructions = new Textarea([
  'label' => 'Special Instructions',
  'name' => 'instructions'
]);

// 3. Add the form controls to Form
$form = new Form([
  'adminEmail' => '',
  'emailSubject' => 'Order form submitted by {{name}}',
  'submitButtonText' => 'Order Now',
  'successMsg' => 'Thanks for your order.'
]);
$form->addControl($name);
$form->addControl($email);
$form->addControl($address);
$form->addControl($datetime);
$form->addControl($crust);
$form->addGroup([
  'controls' => [
    $mozzarella,
    $soy
  ],
  'label' => 'Type of Cheese'
]);
$form->addGroup([
  'arrangement' => 'stacked',
  'controls' => [
    $sausage,
    $pepperoni,
    $peppers,
    $tomato,
    $onion
  ]
]);
$form->addControl($instructions);

// 4. Render the form
$form->render();

?>

    <script src="js/script.js"></script>
  </body>
</html>
