<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <link rel="stylesheet" href="css/styles.css" />
  </head>
  <body>

<?php

// Dependencies
include_once 'lib/dependencies.php';

// 1. Set config parameters (vars $db, $dbTable, others are set here)
include_once 'conf/config.inc.php';

// 2. Create form controls
$name = new Input([
  'name' => 'name',
  'required' => true,
  'message' => 'NAME is required'
]);
$email = new Input([
  'type' => 'email',
  'name' => 'email',
  'label' => 'Email Address',
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

// 3. Add form controls to Form
$Form = new Form([
  'adminEmail' => '',
  'emailSubject' => 'Order form submitted by {{name}}',
  'successMsg' => 'Thanks for your order.'
]);
$Form->addControl($name);
$Form->addControl($email);
$Form->addControl($crust);
$Form->addGroup([
  'controls' => [
    $mozzarella,
    $soy
  ],
  'label' => 'Type of Cheese'
]);
$Form->addGroup([
  'arrangement' => 'stacked',
  'controls' => [
    $sausage,
    $pepperoni,
    $peppers,
    $tomato,
    $onion
  ]
]);
$Form->addControl($instructions);

// Check if form is being submitted. If so, process it; if not, display form
if (isSet($_POST['submitbutton'])) {
  $Database = new Database($db);
  $Form->process($Database, $dbTable);

  print $Form->getResultsHtml();
} else {
  print $Form->getFormHtml();
}

?>

    <script src="js/script.js"></script>
  </body>
</html>
