<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <link rel="stylesheet" href="css/form.css" />
  </head>
  <body>

<?php

// Dependencies
include_once 'lib/functions.inc.php';
include_once 'lib/Database.class.php';
include_once 'lib/Form.class.php';
include_once 'lib/Input.class.php';
include_once 'lib/Select.class.php';
include_once 'lib/Textarea.class.php';

// 1. Set config parameters (vars $db, $dbTable, others are set here)
include_once 'conf/config.inc.php';

// 2. Create form controls
$fname = new Input(array(
  'name' => 'fname',
  'value' => 'Scott',
  'label' => 'First name',
  'required' => true,
  'pattern' => '^[a-zA-Z0-9]+$'
));
$lname = new Input(array(
  'name' => 'lname',
  'value' => 'Haefner',
  'label' => 'Last name'
));
$vanilla = new Input(array(
  'type' => 'radio',
  'name' => 'flavor',
  'id' => 'vanilla',
  'value' => 'vanilla',
  'label' => 'Vanilla',
  'checked' => true
));
$chocolate = new Input(array(
  'type' => 'radio',
  'name' => 'flavor',
  'id' => 'chocolate',
  'value' => 'chocolate',
  'label' => 'Chocolate'
));
$nuts = new Input(array(
  'type' => 'checkbox',
  'name' => 'toppings',
  'id' => 'nuts',
  'value' => 'nuts',
  'label' => 'Nuts',
  'checked' => true
));
$sprinkles = new Input(array(
  'type' => 'checkbox',
  'name' => 'toppings',
  'id' => 'sprinkles',
  'value' => 'sprinkles',
  'label' => 'Sprinkles',
  'checked' => true
));
$cone = new Select(array(
  'name' => 'cone',
  'options' => array(
    'cake' => 'Cake cone',
    'waffle' => 'Waffle cone'
  )
));
$instructions = new Textarea(array(
  'label' => 'Instructions',
  'name' => 'instructions'
));

// 3. Add form controls to Form
$Form = new Form();
$Form->addItem($fname);
$Form->addItem($lname);
$Form->addItem($cone);
$Form->addGroup(array(
  'controls' => array(
    $vanilla,
    $chocolate
  ),
  'label' => 'Flavor'
));
$Form->addGroup(array(
  'arrangement' => 'vertical',
  'controls' => array(
    $nuts,
    $sprinkles
  )
));
$Form->addItem($instructions);

// Check if form is being submitted. If so, process it; if not, display form
if (isSet($_POST['submit'])) {
  $Database = new Database($db);
  $Form->setSuccessMsg('Thanks for your order.');
  $Form->process($Database, $dbTable);

  print $Form->getResultsHtml();
} else {
  print $Form->getFormHtml();
}

?>

  </body>
</html>
