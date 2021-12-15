<?php

/**
 * Create and send an email.
 *
 * @param $options {Array}
 *   [
 *      'content': {String}
 *      'from': {String}
 *      'subject': {String}
 *      'template': {String} // full path to template file (optional)
 *      'to': {String}
 *   ]
 */
class Email {
  private $_content, $_from, $_message, $_subject, $_template, $_to;

  public function __construct($options) {
    $this->_content = $this->_addStyles($options['content']);
    $this->_from = $options['from'];
    $this->_subject = $options['subject'];
    $this->_template = $options['template'];
    $this->_to = $options['to'];

    $this->_message = $this->_getTemplate();

    $this->_createEmail(); // Create the message
  }

  /**
   * Add inline styles to summary results <dl>.
   *
   * @param $content {String}
   *
   * @return $styled {String}
   */
  private function _addStyles($content) {
    $pattern = '/<dd[^>]*>/';
    $replace = '<dd style="color:#000;font-size:16px;margin:0">';
    $styled = preg_replace($pattern, $replace, $content);

    $pattern = '/<dt[^>]*>/';
    $replace = '<dt style="color:#495057;font-size:16px;padding-bottom:.25em;padding-top:1.5em;text-transform:uppercase">';
    $styled = preg_replace($pattern, $replace, $styled);

    return $styled;
  }

  /**
   * Create email message body.
   */
  private function _createEmail() {
    // Substitute msg. content for mustache placeholder
    $pattern = '{{content}}';
    $this->_message = str_replace($pattern, $this->_content, $this->_message);

    // Insert line breaks to avoid mailservers' 990-character limit
    $this->_message = wordwrap($this->_message, 80, "\n", false);
  }

  /**
   * Read email template into a string and return it.
   *
   * @return $template {String}
   */
  private function _getTemplate() {
    $template = '{{content}}'; // default (empty template)

    if (is_file($this->_template)) {
      $template = file_get_contents($this->_template);
    }

    return $template;
  }

  /**
   * Send email.
   */
  public function send() {
    $headers = [
      'From: ' . $this->_from,
      'MIME-Version: 1.0',
      'Content-type: text/html; charset=UTF-8'
    ];

    mail($this->_to, $this->_subject, $this->_message, implode("\r\n", $headers));
  }
}
