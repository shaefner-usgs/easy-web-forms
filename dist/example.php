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
$name = new Input(array(
  'name' => 'name',
  'required' => true,
  'message' => 'NAME is required'
));
$email = new Input(array(
  'type' => 'email',
  'name' => 'email',
  'label' => 'Email Address',
  'required' => true
));
$crust = new Select(array(
  'name' => 'crust',
  'options' => array(
    '' => 'Choose a crust',
    'thin' => 'Thin &amp; Crispy',
    'deep' => 'Chicago Deep Dish',
    'glutenfree' => 'Gluten Free'
  ),
  'required' => true
));
$mozzarella = new Input(array(
  'type' => 'radio',
  'name' => 'cheese',
  'id' => 'mozzarella',
  'value' => 'mozzarella',
  'checked' => true
));
$soy = new Input(array(
  'type' => 'radio',
  'name' => 'cheese',
  'id' => 'soy',
  'value' => 'soy',
  'label' => 'Soy (vegan)',
  'checked' => false
));
$sausage = new Input(array(
  'type' => 'checkbox',
  'name' => 'toppings',
  'id' => 'sausage',
  'value' => 'sausage'
));
$pepperoni = new Input(array(
  'type' => 'checkbox',
  'name' => 'toppings',
  'id' => 'pepperoni',
  'value' => 'pepperoni'
));
$peppers = new Input(array(
  'type' => 'checkbox',
  'name' => 'toppings',
  'id' => 'peppers',
  'value' => 'peppers',
  'label' => 'Bell peppers'
));
$tomato = new Input(array(
  'type' => 'checkbox',
  'name' => 'toppings',
  'id' => 'tomato',
  'value' => 'tomato'
));
$onion = new Input(array(
  'type' => 'checkbox',
  'name' => 'toppings',
  'id' => 'onion',
  'value' => 'onion'
));
$instructions = new Textarea(array(
  'label' => 'Special Instructions',
  'name' => 'instructions'
));

// 3. Add form controls to Form
$Form = new Form(array(
  'adminEmail' => '',
  'emailSubject' => 'Order form submitted by {{name}}',
  'successMsg' => 'Thanks for your order.'
));
$Form->addControl($name);
$Form->addControl($email);
$Form->addControl($crust);
$Form->addGroup(array(
  'controls' => array(
    $mozzarella,
    $soy
  ),
  'label' => 'Type of Cheese'
));
$Form->addGroup(array(
  'arrangement' => 'stacked',
  'controls' => array(
    $sausage,
    $pepperoni,
    $peppers,
    $tomato,
    $onion
  )
));
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
