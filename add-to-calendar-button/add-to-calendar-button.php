<?php
/**
 * Plugin Name:       Add to Calendar Button
 * Plugin URI:        https://add-to-calendar-button.com
 * Description:       Create RSVP forms and beautiful buttons, where people can add events to their calendars.
 * Version:           2.4.1
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
define( 'ATCB_SCRIPT_VERSION', '2.7.2' );
define( 'ATCB_PLUGIN_VERSION', '2.4.1' );
define( 'ATCB_ET_VERSION', '1.0.0' );
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
  'startdatetime',
  'enddate',
  'endtime',  
  'enddatetime',
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
register_activation_hook(__FILE__, 'atcb_installation');
function atcb_installation() {
  set_transient('atcb_load_script_once', true, 12 * HOUR_IN_SECONDS); // Expires after 12 hours
}
add_action('admin_enqueue_scripts', 'atcb_enqueue_script_once');
function atcb_enqueue_script_once() {
  $atcb_settings_options = get_option( 'atcb_global_settings' );
  if (get_transient('atcb_load_script_once') || (isset($_GET['page']) && $_GET['page'] === 'add-to-calendar-setting' && !isset($atcb_settings_options['atcb_init']))) {
    wp_enqueue_script(
      'add-to-calendar-et',
      plugins_url('lib/atcba.js', __FILE__),
      array(),
      ATCB_ET_VERSION,
      array( 
        'strategy'  => 'async',
        'in_footer' => false,
      )
    );
    delete_transient('atcb_load_script_once');
    if (!isset($atcb_settings_options['atcb_init'])) {
      $atcb_settings_options['atcb_init'] = true;
      update_option('atcb_global_settings', $atcb_settings_options);
    }
    // mind to replace m(f+"website-id") with "63a22fdc-3f95-4db6-b483-407756e34c2d" and m(f+"host-url") with "https://a.add-to-calendar-button.com" at the atcba.js
  }
}

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
    array(),
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
$unstyle = $atcb_settings_options && isset($atcb_settings_options['atcb_go_unstyle']) && ($atcb_settings_options['atcb_go_unstyle'] === 'true' || $atcb_settings_options['atcb_go_unstyle'] === true) ? true : false;
add_action( 'wp_enqueue_scripts', function () use ($unstyle) {
  atcb_enqueue_script($unstyle);
} );

// Function to check whether a value is an allowed attribute
function atcb_is_allowed_attribute( $value ) {
  global $allowedAttributes;
  // remove a potential prefix (mf-, sc-, acf-)
  $value = preg_replace('/^(mf|sc|acf)-/', '', $value);
  return in_array(strtolower($value), $allowedAttributes, true);
}

// SHORTCODE
function atcb_shortcode_func( $atts ) {
  $output = '<add-to-calendar-button';
  // check if $atts includes "prokey"
  $prokey_given = (isset($atts['prokey']) || isset($atts['proKey'])) ? true : false;
  $dynamic_override = false;
  // evaluate the attributes
  foreach ( $atts as $key => $value ) {
    if ( is_numeric($key) ) {
      // do not process any unknown attributes to prevent XSS
      if ( !atcb_is_allowed_attribute($value) ) {
        continue;
      }
      $output .= ' ' . esc_attr( $value );
    } else {
      // do not process any unknown attributes to prevent XSS
      if ( !atcb_is_allowed_attribute($key) ) {
        continue;
      }
      $valueContent = esc_attr($value);
      if ($prokey_given) {
        // if the key is prefixed with mf-, get the value from the meta field
        if ( preg_match('/^mf-/', $key, $matches) ) {
          $postId = get_the_ID();
          $parsed = get_post_meta($postId, $valueContent, true);
          if ($parsed === '') continue;
          $valueStr = $parsed;
          $dynamic_override = true;
        } else
        // if the key is prefixed with acf-, get the value from the ACF field
        if ( preg_match('/^acf-/', $key, $matches) ) {
          $parsed = get_field($valueContent, false, true, true);
          if ($parsed === '') continue;
          $valueStr = $parsed;
          $dynamic_override = true;
        } else
        // if the key is prefixed with sc-, get the value from the shortcode
        if ( preg_match('/^sc-/', $key, $matches) ) {
          $valueContent = '[' . $valueContent . ']';
          $parsed = do_shortcode( $valueContent );
          if ($parsed === '') continue;
          $valueStr = $parsed;
          $dynamic_override = true;
        } else {
          $valueStr = $valueContent;
        }
        // remove any prefix (mf-, sc-, acf-)
        $key = preg_replace('/^(mf|sc|acf)-/', '', $key);
        // if key is startdatetime or enddatetime, we split its value by "T" and set date and time separately
        if ($key === 'startdatetime' || $key === 'enddatetime') {
          $valueStrParts = strpos($valueStr, 'T') !== false ? explode('T', $valueStr) : explode(' ', $valueStr);
          // if valueStrParts only has 1 element, continue
          if (count($valueStrParts) === 1) continue;
          // set date and time manually, but only if it matches the format YYY-MM-DD, HH:MM (otherwise, skip)
          $key_prefix = $key === 'startdatetime' ? 'start' : 'end';
          // strip valueStrParts[0] to 10 chars, valueStrParts[1] to 5 chars
          $valueStrParts[0] = substr($valueStrParts[0], 0, 10);
          $valueStrParts[1] = substr($valueStrParts[1], 0, 5);
          if (preg_match('/^\d\d\d\d-\d\d-\d\d$/', $valueStrParts[0]) && preg_match('/^\d\d:\d\d$/', $valueStrParts[1])) {
            $output .= ' ' . $key_prefix . 'date="' . $valueStrParts[0] . '" ' . $key_prefix . 'time="' . $valueStrParts[1] . '"';
          }
          continue;
        }
      } else {
        // replace "{{sc_start}}", "{{sc_end}}" with "[" and "]" to allow for nested shortcodes - DEPRECATED, but left active for backwards compatibility!
        $valueContent = str_replace('{sc_start}', '[', $valueContent);
        $valueContent = str_replace('{sc_end}', ']', $valueContent);
        $valueStr = do_shortcode($valueContent);
      }
      // strip quotes and sanitize
      $valueStr = str_replace('"', '&quot;', $valueStr);
      // replace [ with { and ] with } to avoid conflicts with the shortcode
      $valueStr = str_replace('[', '{', $valueStr);
      $valueStr = str_replace(']', '}', $valueStr);
      // strip tags and sanitize
      $valueStr = wp_strip_all_tags($valueStr, true);
      $output .= ' ' . esc_attr( $key ) . '="' . esc_attr( $valueStr ) . '"';
    }
  }
  // if $prokey_given, we set the prooverride, proxy, and debug (if admin) attribute
  if ($dynamic_override) {
    $output .= ' prooverride proxy="false"';
    if (is_admin()) {
      $output .= ' debug';
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
  // prepare isPro info
  $atcb_settings_options = get_option('atcb_global_settings');
  $is_pro_active = $atcb_settings_options && isset($atcb_settings_options['atcb_pro_active']) && ($atcb_settings_options['atcb_pro_active'] === 'true' || $atcb_settings_options['atcb_pro_active'] === true) ? true : false;
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
      'label_location' => __("Location", 'add-to-calendar-button'),
      'label_description' => __("Description", 'add-to-calendar-button'),
      'label_timezone' => __("Time Zone", 'add-to-calendar-button'),
      'label_options' => __("Calendar options", 'add-to-calendar-button'),
      'label_others' => __("Other attributes", 'add-to-calendar-button'),
      'label_override' => __("Additional overrides", 'add-to-calendar-button'),
      'label_no' => __('No', "add-to-calendar-button"),
      'label_datetime_input' => __('Date/Time Input Scheme', "add-to-calendar-button"),
      'label_allday' => __('All-day', "add-to-calendar-button"),
      'label_date_plus_time' => __('Date + Time', "add-to-calendar-button"),
      'label_datetime' => __('Datetime', "add-to-calendar-button"),
      'label_startdatetime' => __('Start Date and Time', "add-to-calendar-button"),
      'label_enddatetime' => __('End Date and Time', "add-to-calendar-button"),
      'label_startdate' => __('Start Date', "add-to-calendar-button"),
      'label_enddate' => __('End Date', "add-to-calendar-button"),
      'label_starttime' => __('Start Time', "add-to-calendar-button"),
      'label_endtime' => __('End Time', "add-to-calendar-button"),
      'help' => __("Click here for documentation", 'add-to-calendar-button'),
      'note' => __("Mind that the interaction with the button is blocked in edit mode", 'add-to-calendar-button'),
      'note_dynamic' => __("Also mind that dynamic date overrides are not evaluated in edit mode", 'add-to-calendar-button')
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
      'isProActive' => $is_pro_active,
      'allowedAttributes' => $allowedAttributes, // this is a global variable
      'defaultTimeZone' => $tz,
      'defaultTitle' => __("My Event Title", 'add-to-calendar-button'),
    ]
  );
}
add_action( 'init', 'atcb_register_block' );

?>
