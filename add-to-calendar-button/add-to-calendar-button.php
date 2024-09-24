<?php
/**
 * Plugin Name:       Add to Calendar Button
 * Plugin URI:        https://add-to-calendar-button.com
 * Description:       Create RSVP forms and beautiful buttons, where people can add events to their calendars.
 * Version:           2.3.9
 * Requires at least: 5.7
 * Requires PHP:      7.4
 * Author:            Jens Kuerschner
 * Author URI:        https://add-to-calendar-pro.com
 * License:           GPLv3 or later
 * Text Domain:       add-to-calendar-button
 *
 * @package add-to-calendar-button
 */

/*
This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 3
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

Mind that while this plugin is licensed under the GPLv3 licsense,
the underlying script to generate the buttons is licensed under
the  Elastic License 2.0 (ELv2). They are compatible for regular
use, but you are not allowed to rework the core script and 
provide the product (generating an add-to-calendar-button) to 
others as a managed service.
*/

defined('ABSPATH') or die("No script kiddies please!");

// DEFINE CONSTANTS and rather global variables
define( 'ATCB_SCRIPT_VERSION', '2.6.19' );
define( 'ATCB_PLUGIN_VERSION', '2.3.9' );
$allowedAttributes = [ // we need to use lower case attributes here, since the shortcode makes all attrs lower case
  'prokey',
  'instance',
  'debug',
  'prooverride',
  'cspnonce',
  'identifier',
  'name',
  'dates',
  'description',
  'startdate',
  'starttime',
  'enddate',
  'endtime',
  'timezone',
  'useusertz',
  'location',
  'status',
  'uid',
  'organizer',
  'attendee',
  'icsfile',
  'images',
  'recurrence',
  'recurrence_until',
  'recurrence_byday',
  'recurrence_bymonth',
  'recurrence_bymonthday',
  'recurrence_weekstart',
  'sequence',
  'recurrence_interval',
  'recurrence_count',
  'availability',
  'created',
  'updated',
  'subscribe',
  'options',
  'optionsmobile',
  'optionsios',
  'icalfilename',
  'liststyle',
  'buttonstyle',
  'trigger',
  'hideiconbutton',
  'hideiconlist',
  'hideiconmodal',
  'hidetextlabelbutton',
  'hidetextlabellist',
  'buttonslist',
  'hidebackground',
  'hidecheckmark',
  'hidebranding',
  'size',
  'label',
  'inline',
  'inlinersvp',
  'customlabels',
  'customcss',
  'lightmode',
  'language',
  'hiderichdata',
  'bypasswebviewcheck',
  //'blockinteraction',
  'stylelight',
  'styledark',
  'disabled',
  'hidden',
  'hidebutton',
  'pastdatehandling',
  'proxy',
  'fakemobile',
  'fakeios',
  'fakeandroid',
  'forceoverlay',
  'rsvp',
  'ty',
  'customVar',
  'dev',
];

// SETUP STUFF
// include admin options page
function enqueue_plugin_settings_css() {
  wp_enqueue_style('atcb-options-css', plugin_dir_url(__FILE__) . 'atcb-options.css');
}
if (is_admin()) {
  $admin_options = plugin_dir_path(__FILE__) . 'atcb-options.php';
  if (file_exists($admin_options)) {
    include $admin_options;
    add_action('admin_enqueue_scripts', 'enqueue_plugin_settings_css');
  } else {
    echo 'Plugin Add to Calendar Button seems to be corrupted. File not found: ' . $admin_options;
  }
}

// set custom plugin links
$plugin_links = plugin_dir_path(__FILE__) . 'atcb-plugin-links.php';
if (file_exists($plugin_links)) {
  include $plugin_links;
  add_filter("plugin_row_meta", 'atcb_plugin_details_links', 10, 2);
  if (is_admin()) {
    $plugin = plugin_basename(__FILE__);
    add_filter("plugin_action_links_$plugin", 'atcb_add_settings_link');
  }
} else {
  echo 'Plugin Add to Calendar Button seems to be corrupted. File not found: ' . $plugin_links;
}

// LOADING THE SCRIPT
// load button script
function atcb_enqueue_script( $unstyle = false ) {
  if ( $unstyle === true ) {
    $script = 'atcb-unstyle.min.js';
  } else {
    $script = 'atcb.min.js';
  }
  wp_enqueue_script(
    'add-to-calendar-button',
    plugins_url('lib/' . $script, __FILE__),
    '',
    ATCB_SCRIPT_VERSION,
    array( 
      'strategy'  => 'async',
      'in_footer' => true,
    )
  );
}
// ...on the admin panel
add_action( 'admin_enqueue_scripts', 'atcb_enqueue_script' );
// ...on the website
$atcb_settings_options = get_option( 'atcb_global_settings' );
$unstyle = $atcb_settings_options && $atcb_settings_options['atcb_go_unstyle'] && ($atcb_settings_options['atcb_go_unstyle'] === 'true' || $atcb_settings_options['atcb_go_unstyle'] === true) ? true : false;
add_action( 'wp_enqueue_scripts', function () use ($unstyle) {
  atcb_enqueue_script($unstyle);
} );

// SHORTCODE
function atcb_shortcode_func( $atts ) {
  global $allowedAttributes;
  $output = '<add-to-calendar-button';
  foreach ( $atts as $key => $value ) {
    if ( is_numeric($key) ) {
      // do not process any unknown attributes to prevent XSS
      if ( !in_array(strtolower($value), $allowedAttributes, true) ) {
        continue;
      }
      $output .= ' ' . esc_attr( $value );
    } else {
      // do not process any unknown attributes to prevent XSS
      if ( !in_array(strtolower($key), $allowedAttributes, true) ) {
        continue;
      }
      $valueContent = esc_attr($value);
      // replace "{{sc_start}}", "{{sc_end}}" with "[" and "]" to allow for nested shortcodes
      $valueContent = str_replace('{sc_start}', '[', $valueContent);
      $valueContent = str_replace('{sc_end}', ']', $valueContent);
      $valueStr = do_shortcode($valueContent);
      // strip quotes and sanitize
      $valueStr = str_replace('"', '', $valueStr);
      $valueStr = wp_strip_all_tags($valueStr, true);
      $output .= ' ' . esc_attr( $key ) . '="' . esc_attr( $valueStr ) . '"';
    }
  }
  $output .= '></add-to-calendar-button>';
  return $output;
}
add_shortcode( 'add-to-calendar-button', 'atcb_shortcode_func' );

// GUTENBERG BLOCK
function atcb_register_block() {
  global $allowedAttributes;
  // register the block script
  wp_register_script( 'atcb-block', plugins_url('build/block.js', __FILE__), array('wp-blocks', 'wp-block-editor', 'wp-element'), ATCB_PLUGIN_VERSION, true );
  // register the actual block
  register_block_type( 'add-to-calendar/button', array('editor_script' => 'atcb-block') );
  // add i18n
  load_plugin_textdomain( 'add-to-calendar-button', false, dirname(plugin_basename( __FILE__ )) . '/languages' );
  $locale = get_Locale();
  $language = explode( '_', $locale )[0];
  wp_localize_script(
    'atcb-block',
    'atcbI18nObj',
    [
      'language' => $language,
      'description' => __("Creates a button that adds an event to the user's calendar.", 'add-to-calendar-button'),
      'keywords' => [
        'k1' => __("Calendar", 'add-to-calendar-button'),
        'k2' => __("save", 'add-to-calendar-button'),
        'k3' => __("Date", 'add-to-calendar-button'),
        'k4' => __("Appointment", 'add-to-calendar-button')
      ],
      'label_name' => __("Name", 'add-to-calendar-button'),
      'label_options' => __("Calendar options", 'add-to-calendar-button'),
      'label_others' => __("Other attributes", 'add-to-calendar-button'),
      'label_override' => __("Overrides", 'add-to-calendar-button'),
      'help' => __("Click here for documentation", 'add-to-calendar-button'),
      'override_note' => __("With PRO active, only some attributes can be manipulated here. Check the docs for more details and try to adjust an event in the app first.", 'add-to-calendar-button'),
      'note' => __("Mind that the interaction with the button is blocked in edit mode", 'add-to-calendar-button')
    ]
  );
  // transmit further settings
  $tz = wp_timezone_string();
  // if tz starts with +,-, or 0, we set it to "America/New_York" as default
  if ( preg_match('/^[+-0]/', $tz) ) {
    $tz = 'America/New_York';
  }
  wp_localize_script(
    'atcb-block',
    'atcbSettings',
    [
      'allowedAttributes' => $allowedAttributes,
      'defaultTimeZone' => $tz,
      'defaultTitle' => __("My Event Title", 'add-to-calendar-button'),
    ]
  );
}
add_action( 'init', 'atcb_register_block' );

?>