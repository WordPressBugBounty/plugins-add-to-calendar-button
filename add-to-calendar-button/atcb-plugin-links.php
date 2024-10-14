<?php
/**
 * This File is part of the Plugin 'Add to Calendar Button' (https://add-to-calendar-button.com)
 * Create RSVP forms and beautiful buttons, where people can add events to their calendars.
 *
 * Author: Jens Kuerschner
 * Author URI: https://add-to-calendar-pro.com
 *
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

function atcb_plugin_details_links( $links, $plugin_file_name ) {
  if ( strpos($plugin_file_name, 'add-to-calendar-button.php')) {
    $locale = get_Locale();
    $language = explode( '_', $locale )[0];
    $supportedLanguages = ['en', 'de'];
    if ($language == 'en' or !in_array($language, $supportedLanguages)) {
      $language = '';
    } else {
      $language .= '/';
    }
    $atcb_settings_options = get_option( 'atcb_global_settings' );
    $is_pro = $atcb_settings_options && $atcb_settings_options['atcb_pro_active'] && ($atcb_settings_options['atcb_pro_active'] === 'true' || $atcb_settings_options['atcb_pro_active'] === true) ? true : false;
    if ( $is_pro === true ) {
      $links[] = '<a href="https://docs.add-to-calendar-pro.com/' . $language . 'integration/wordpress" target="_blank" rel="noopener">' . __("Documentation", 'add-to-calendar-button') . '</a>';
    } else {
      $links[] = '<a href="https://add-to-calendar-button.com/' . $language . 'configuration" target="_blank" rel="noopener">' . __("Configuration Options", 'add-to-calendar-button') . '</a>';
      $links[] = '<a href="https://add-to-calendar-pro.com/' . $language . '" target="_blank" rel="noopener">' . __("Go PRO", 'add-to-calendar-button') . '</a>';
    }
  }
  return $links;
}

function atcb_add_settings_link( $plugin_actions ) {
  $new_actions = array();
  $new_actions[] = '<a href="' . esc_url( admin_url( 'options-general.php?page=add-to-calendar-setting' )) . '">' . __("Settings", 'add-to-calendar-button' ) . '</a>';
  return array_merge( $new_actions, $plugin_actions );
}

?>