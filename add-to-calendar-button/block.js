// Import necessary WordPress packages
import { InspectorControls } from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import { createElement } from '@wordpress/element';
import { SelectControl, ToggleControl, TextControl, TextareaControl } from '@wordpress/components';
import Select from 'react-select';

// Retrieve the language and settings from the global object
const allowedFields = window.atcbSettings.allowedAttributes;
const atcbDefaultTimeZone = window.atcbSettings.defaultTimeZone;
const atcbDefaultTitle = window.atcbSettings.defaultTitle;
const atcbLanguage = window.atcbI18nObj.language;

// attributes to be added to the button within the editor mode
const atcbEditorAttr = {
	debug: true,
	blockInteraction: true,
};

// calendar types
const selectOptions = [
	{ label: 'Apple', value: 'apple' },
	{ label: 'Google', value: 'google' },
	{ label: 'iCal', value: 'ical' },
	{ label: 'Microsoft 365', value: 'ms365' },
	{ label: 'Outlook.com', value: 'outlookcom' },
	{ label: 'Microsoft Teams', value: 'msteams' },
	{ label: 'Yahoo', value: 'yahoo' },
];

// function to validate field against allowedFields, removing a potential prefix (mf-, sc-, acf-)
const atcbValidateField = (field, prefix) => {
  if (prefix === 'mf-') return allowedFields.includes(field.replace(prefix, ''));
  if (prefix === 'sc-') return allowedFields.includes(field.replace(prefix, ''));
  if (prefix === 'acf-') return allowedFields.includes(field.replace(prefix, ''));
  return allowedFields.includes(field);
}

// preparing a dynamic date in the future for the default values
const atcbDefaultDate = (function () {
	const today = new Date();
	const nextDay = new Date();
	nextDay.setDate( today.getDate() + 3 );
	return nextDay.getFullYear() +
	'-' +
	( '0' + ( nextDay.getMonth() + 1 ) ).slice( -2 ) +
	'-' +
	( '0' + nextDay.getDate() ).slice( -2 );
})();

// defining the default event strings
const atcbDefaultLanguage = ( function () {
	const supportedLanguages = ['en', 'de', 'nl', 'fa', 'fr', 'es', 'et', 'pt', 'tr', 'zh', 'ar', 'hi', 'pl', 'ro', 'id', 'no', 'fi', 'sv', 'cs', 'ja', 'it', 'ko', 'vi'];
	if ( atcbLanguage != 'en' && atcbLanguage != '' && supportedLanguages.includes(atcbLanguage) ) {
		return ' language="' + atcbLanguage + '"';
	}
	return '';
} )();

// defining a language slug for external websites
const atcbLanguageSlug = ( function () {
	const supportedLanguages = ['en', 'de'];
	if ( atcbLanguage != 'en' && atcbLanguage != '' && supportedLanguages.includes(atcbLanguage) ) {
		return atcbLanguage + '/';
	}
	return '';
} )();

// defining a custom icon for the block
const atcbIconEl = createElement(
	'svg',
	{
		width: 24,
		height: 24,
		viewBox: '0 0 24 24',
	},
	createElement( 'path', {
		d: 'm14.626 4.6159c0-0.33981 0.33589-0.61587 0.75122-0.61587s0.75122 0.27606 0.75122 0.61587v2.6977c0 0.33981-0.33589 0.61587-0.75122 0.61587s-0.75122-0.27606-0.75122-0.61587zm-0.47524 9.8989c0.2383 0 0.43228 0.19398 0.43228 0.43228 0 0.2383-0.19398 0.43228-0.43228 0.43228l-1.686-0.0052-0.0052 1.6835c0 0.2383-0.19398 0.43228-0.43228 0.43228-0.2383 0-0.43228-0.19398-0.43228-0.43228l0.0052-1.6847-1.6835-0.0065c-0.2383 0-0.43228-0.19398-0.43228-0.43228 0-0.2383 0.19398-0.43228 0.43228-0.43228l1.6847 0.0052 0.0052-1.6835c0-0.2383 0.19398-0.43228 0.43228-0.43228s0.43228 0.19398 0.43228 0.43228l-0.0052 1.686zm-6.2951-9.8989c0-0.33981 0.33597-0.61587 0.7513-0.61587s0.75122 0.27606 0.75122 0.61587v2.6977c0 0.33981-0.33589 0.61587-0.75122 0.61587s-0.75122-0.27606-0.75122-0.61587zm-3.0218 5.2847h14.332v-3.1052c0-0.10415-0.04296-0.19918-0.11199-0.2695-0.06903-0.069034-0.16407-0.11199-0.2695-0.11199h-1.3736c-0.23046 0-0.4166-0.18614-0.4166-0.4166s0.18614-0.4166 0.4166-0.4166h1.3736c0.33461 0 0.63795 0.13671 0.85801 0.35677 0.22006 0.22006 0.35669 0.52332 0.35669 0.85793v11.99c0 0.33461-0.13671 0.63795-0.35677 0.85801-0.22006 0.22006-0.5234 0.35677-0.85801 0.35677h-13.569c-0.33461 0-0.63795-0.13671-0.85801-0.35677-0.22006-0.22134-0.35677-0.52476-0.35677-0.85937v-11.989c0-0.33461 0.13671-0.63795 0.35677-0.85801s0.5234-0.35677 0.85801-0.35677h1.4673c0.23046 0 0.4166 0.18614 0.4166 0.4166s-0.18614 0.4166-0.4166 0.4166h-1.4673c-0.10415 0-0.19918 0.042956-0.2695 0.11199-0.069034 0.069034-0.11199 0.16407-0.11199 0.2695zm14.332 0.83457h-14.332v8.0488c0 0.10415 0.042956 0.19918 0.11199 0.2695 0.069034 0.06903 0.16407 0.11199 0.2695 0.11199h13.569c0.10415 0 0.19918-0.04296 0.2695-0.11199 0.06903-0.06903 0.11199-0.16407 0.11199-0.2695zm-8.5996-4.3212c-0.23046 0-0.4166-0.18614-0.4166-0.4166s0.18614-0.4166 0.4166-0.4166h2.7979c0.23046 0 0.4166 0.18614 0.4166 0.4166s-0.18614 0.4166-0.4166 0.4166z',
		strokeWidth: '.079993',
	} )
);

// global function to parse the input
function atcbParseAttributes( attributes, overrides, overridesOnly = false ) {
	// parse attributes from "overrides"
	const pattern = /([\w]+)(?:\s?=\s?)?(?:"([^"]+)"|'([^']+)')?/g;
	let match;
	const parsedAttributes = {};
	while ( ( match = pattern.exec( overrides ) ) !== null ) {
		// parsing the attributes, except for unkown attribute, which cannot be used and would even throw an error in some cases (e.g. style)
		if ( match[1] && atcbValidateField(match[1].toLowerCase(), match[1].split('-')[0]) ) {
			if ( match[3] ) {
				parsedAttributes[ match[1].toLowerCase() ] = match[3];
			} else if ( match[2] ) {
				parsedAttributes[ match[1].toLowerCase() ] = match[2];
			} else {
				parsedAttributes[ match[1].toLowerCase() ] = "true";
			}
		}
	}
	// for description, dates, and customLabels, we replace any [ with { and any ] with } to avoid conflicts with the shortcode
	if ( parsedAttributes['description'] ) {
		parsedAttributes['description'] = parsedAttributes['description'].replace( /\[/g, '{' ).replace( /\]/g, '}' );
	}
	if ( parsedAttributes['dates'] ) {
		// for dates, we also need to make sure the JSON stays valid
		parsedAttributes['dates'] = parsedAttributes['dates'].replace( /\[/g, '{' ).replace( /\]/g, '}' ).replace( /^{{/, '{' ).replace( /}}$/, '}' );
	}
	if ( parsedAttributes['customLabels'] ) {
		parsedAttributes['customLabels'] = parsedAttributes['customLabels'].replace( /\[/g, '{' ).replace( /\]/g, '}' );
	}
	if (overridesOnly) return parsedAttributes; // return early if this is only for overrides
	// validating whether prokey, name, and options are already set and only take the explicit fields, if not
	if ( attributes.isPro && parsedAttributes['prokey'] === undefined && attributes.prokey && attributes.prokey !== '' ) {
		// only add if valid UUID
		if ( attributes.prokey.match( /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}/ ) ) {
			parsedAttributes['prokey'] = attributes.prokey;
		}
	}
	if (!attributes.isPro) {
		if ( parsedAttributes['name'] === undefined && attributes.name && attributes.name !== '' ) {
			parsedAttributes['name'] = attributes.name;
		}
		if ( parsedAttributes['options'] === undefined && attributes.options) {
			if ( Array.isArray(attributes.options) ) {
				parsedAttributes['options'] = "'" + attributes.options.join( "','" ) + "'";
			} else {
				parsedAttributes['options'] = "'" + attributes.options.replace( /,/g, "','" ) + "'";
			}
		}
	} else if (attributes['dynamicdateoverride'] !== 'no') {
		// Parse dynamic date override attributes
		const updatedAttributes = {};
		const dynamicPrefix = attributes.dynamicdateoverride + '-';
		if (attributes.datetimeinput === 'all-day') {
			if ( attributes.startdate && attributes.startdate !== '' ) {
				updatedAttributes[dynamicPrefix + 'startdate'] = attributes.startdate;
			}
			if ( attributes.enddate && attributes.enddate !== '' ) {
				updatedAttributes[dynamicPrefix + 'enddate'] = attributes.enddate;
			}
		} else if (attributes.datetimeinput === 'date+time') {	
			if ( attributes.startdate && attributes.startdate !== '' ) {
				updatedAttributes[dynamicPrefix + 'startdate'] = attributes.startdate;
				if ( attributes.starttime && attributes.starttime !== '' ) {
					updatedAttributes[dynamicPrefix + 'starttime'] = attributes.starttime;
				}
			}
			if ( attributes.enddate && attributes.enddate !== '' ) {
				updatedAttributes[dynamicPrefix + 'enddate'] = attributes.enddate;
				if ( attributes.endtime && attributes.endtime !== '' ) {
					updatedAttributes[dynamicPrefix + 'endtime'] = attributes.endtime;
				}
			}
		} else if (attributes.datetimeinput === 'datetime') {
			if ( attributes.startdatetime && attributes.startdatetime !== '' ) {
				updatedAttributes[dynamicPrefix + 'startdatetime'] = attributes.startdatetime;
			}
			if ( attributes.enddatetime && attributes.enddatetime !== '' ) {
				updatedAttributes[dynamicPrefix + 'enddatetime'] = attributes.enddatetime;
			}
		}
		if (attributes.dynamicName) updatedAttributes[dynamicPrefix + 'name'] = attributes.dynamicName;
		if (attributes.dynamicLocation) updatedAttributes[dynamicPrefix + 'location'] = attributes.dynamicLocation;
		if (attributes.dynamicDescription) updatedAttributes[dynamicPrefix + 'description'] = attributes.dynamicDescription;
		if (attributes.dynamicTimeZone) updatedAttributes[dynamicPrefix + 'timezone'] = attributes.dynamicTimeZone;
		Object.assign(parsedAttributes, updatedAttributes);
	}
  return parsedAttributes;
}

// the actual block generation magic
registerBlockType( 'add-to-calendar/button', {
	title: 'Add to Calendar Button',
	icon: atcbIconEl,
	category: 'widgets',
	keywords: [ 'Button', 'Event', 'Link', window.atcbI18nObj.keywords.k1, window.atcbI18nObj.keywords.k2, window.atcbI18nObj.keywords.k3, window.atcbI18nObj.keywords.k4 ],
	description: window.atcbI18nObj.description,
	textdomain: 'add-to-calendar-button',
	attributes: {
		isPro: { type: 'boolean', default: window.atcbSettings ? window.atcbSettings.isProActive : false },
		prokey: { type: 'string', default: '' },
		name: { type: 'string', default: atcbDefaultTitle },
		options: { type: 'array', default: ['apple','google','ical','outlookcom','ms365','yahoo'] },
		content: { type: 'string', default: `startdate="${ atcbDefaultDate }"\ntimeZone="${ atcbDefaultTimeZone }"${ atcbDefaultLanguage }` },
		prooverrides: { type: 'string', default: '' },
		dynamicdateoverride: { type: 'string', default: 'no' },
		datetimeinput: { type: 'string', default: 'all-day' },
		startdate: { type: 'string', default: '' },
		enddate: { type: 'string', default: '' },
		starttime: { type: 'string', default: '' },
		endtime: { type: 'string', default: '' },
		startdatetime: { type: 'string', default: '' },
		enddatetime: { type: 'string', default: '' },
		dynamicName: { type: 'string', default: '' },
		dynamicLocation: { type: 'string', default: '' },
		dynamicDescription: { type: 'string', default: '' },
		dynamicTimeZone: { type: 'string', default: '' },
	},
	edit: function ( props ) {
		const { attributes, setAttributes } = props;
		if (!attributes.isPro && window.atcbSettings && window.atcbSettings.isProActive) {
			setAttributes( { isPro: true } );
		}
		// Select component for the options
		const MyMultiSelect = ({ options, value, onChange }) => {
			return (
				<Select
					id='atcb-options'
					isMulti
					isSearchable={false}
					options={options}
					value={value}
					onChange={onChange}
				/>
			);
		};
		// Function to update the 'isPro' attribute
    const onTogglePro  = ( newValue ) => {
			setAttributes( { isPro: newValue } );
		};
		// Dynamic Date Override Functions
		const onChangedynamicdateoverride = (newValue) => {
			setAttributes({ dynamicdateoverride: newValue });
		};
		const onChangedatetimeinput = (newValue) => {
			setAttributes({ datetimeinput: newValue });
		};
		const updateDynamicField = (field, value) => {
			setAttributes({ [field]: value });
		};
		// check the "others" input for name, prokey, and options and copy them to the respective attributes
		function atcbCheckForSingleFieldsInOthers(content = '') {
			if ( content === '' ) {
				content = attributes.content;
			}
			const inputContentAttributes = atcbParseAttributes( attributes, content, true );
			if ( inputContentAttributes[ 'name' ] && inputContentAttributes[ 'name' ] !== '' && !attributes.isPro ) {
				setAttributes( { name: inputContentAttributes[ 'name' ] } );
			}
			if ( inputContentAttributes[ 'prokey' ] && inputContentAttributes[ 'prokey' ] !== '' && attributes.isPro ) {
				setAttributes( { prokey: inputContentAttributes[ 'prokey' ] } );
			}
			if ( inputContentAttributes[ 'options' ] && inputContentAttributes[ 'options' ] !== '' && !attributes.isPro ) {
				const optionsInput = inputContentAttributes[ 'options' ].replace( /[\['"\]]/g, '' ).toLowerCase().replace(/microsoft/g, 'ms').replace(/\s|\./g, '').split( ',' );
				setAttributes( { options: optionsInput } );
			}
		}
		// update attributes on change
		const atcbUpdateProKey  = ( newValue ) => {
			setAttributes( { prokey: newValue } );
		};
		function atcbUpdateName( newValue ) {
			setAttributes( { name: newValue } );
		}
		function atcbUpdateOptions( event ) {
			const newValues = event.map(option => option.value);
      setAttributes( { options: newValues } );
		}
		function atcbUpdateOtherParams( newValue ) {
			setAttributes( { content: newValue } );
			atcbCheckForSingleFieldsInOthers(newValue);
		}
		function atcbUpdateProOverrides( newValue ) {
			setAttributes( { prooverrides: newValue } );
		}
		// build the form
		return [
			createElement(
				InspectorControls,
				{},
				createElement(
					'div',
					{ style: { padding: '10px' } },
					// Only show the PRO toggle if isPro is false
					!window.atcbSettings.isProActive && createElement( ToggleControl, {
						label: 'PRO',
						checked: attributes.isPro,
						onChange: onTogglePro
					})
				),
				attributes.isPro ?
					createElement(
						'div',
						{},
						createElement(
							'div',
							{ style: { padding: '10px' } },
							createElement( TextControl, {
								label: 'ProKey',
								value: attributes.prokey,
								onChange: atcbUpdateProKey
							})
						),
						createElement(
							'div',
							{ style: { padding: '10px' } },
							createElement( SelectControl, {
								label: 'Dynamic Date Override',
								value: attributes.dynamicdateoverride,
								options: [
									{ label: window.atcbI18nObj.label_no, value: 'no' },
									{ label: 'Meta Fields', value: 'mf' },
									{ label: 'Advanced Custom Fields (ACF)', value: 'acf' },
									{ label: 'Shortcode', value: 'sc' },
								],
								onChange: onChangedynamicdateoverride
							})
						),
						attributes.dynamicdateoverride !== 'no' && createElement(
							'div',
							{ style: { padding: '10px' } },
							createElement( SelectControl, {
								label: window.atcbI18nObj.label_datetime_input,
								value: attributes.datetimeinput,
								options: [
									{ label: window.atcbI18nObj.label_allday, value: 'all-day' },
									{ label: window.atcbI18nObj.label_date_plus_time, value: 'date+time' },
									{ label: window.atcbI18nObj.label_datetime, value: 'datetime' },
								],
								onChange: onChangedatetimeinput
							})
						),
						attributes.dynamicdateoverride !== 'no' && (
							attributes.datetimeinput === 'all-day' ?
								createElement(
									'div',
									{ style: { padding: '10px' } },
									createElement( TextControl, {
										label: window.atcbI18nObj.label_startdate,
										value: attributes.startdate,
										onChange: (value) => updateDynamicField('startdate', value)
									}),
									createElement( TextControl, {
										label: window.atcbI18nObj.label_enddate,
										value: attributes.enddate,
										onChange: (value) => updateDynamicField('enddate', value)
									})
								)
							: attributes.datetimeinput === 'date+time' ?
								createElement(
									'div',
									{ style: { padding: '10px' } },
									createElement( TextControl, {
										label: window.atcbI18nObj.label_startdate,
										value: attributes.startdate,
										onChange: (value) => updateDynamicField('startdate', value)
									}),
									createElement( TextControl, {
										label: window.atcbI18nObj.label_starttime,
										value: attributes.starttime,
										onChange: (value) => updateDynamicField('starttime', value)
									}),
									createElement( TextControl, {
										label: window.atcbI18nObj.label_enddate,
										value: attributes.enddate,
										onChange: (value) => updateDynamicField('enddate', value)
									}),
									createElement( TextControl, {
										label: window.atcbI18nObj.label_endtime,
										value: attributes.endtime,
										onChange: (value) => updateDynamicField('endtime', value)
									})
								)
							:
								createElement(
									'div',
									{ style: { padding: '10px' } },
									createElement( TextControl, {
										label: window.atcbI18nObj.label_startdatetime,
										value: attributes.startdatetime,
										onChange: (value) => updateDynamicField('startdatetime', value)
									}),
									createElement( TextControl, {
										label: window.atcbI18nObj.label_enddatetime,
										value: attributes.enddatetime,
										onChange: (value) => updateDynamicField('enddatetime', value)
									})
								)
						),
						attributes.dynamicdateoverride !== 'no' && createElement(
							'div',
							{ style: { padding: '10px' } },
							createElement( TextControl, {
								label: window.atcbI18nObj.label_name,
								value: attributes.dynamicName,
								onChange: (value) => updateDynamicField('dynamicName', value)
							}),
							createElement( TextControl, {
								label: window.atcbI18nObj.label_location,
								value: attributes.dynamicLocation,
								onChange: (value) => updateDynamicField('dynamicLocation', value)
							}),
							createElement( TextControl, {
								label: window.atcbI18nObj.label_description,
								value: attributes.dynamicDescription,
								onChange: (value) => updateDynamicField('dynamicDescription', value)
							}),
							createElement( TextControl, {
								label: window.atcbI18nObj.label_timezone,
								value: attributes.dynamicTimeZone,
								onChange: (value) => updateDynamicField('dynamicTimeZone', value)
							})
						),
						createElement(
							'div',
							{ style: { padding: '10px', marginTop: '10px', borderTop: '1px solid #ccc' } },
							createElement( TextareaControl, {
								label: window.atcbI18nObj.label_override,
								value: attributes.prooverrides,
								rows: 5,
								onChange: atcbUpdateProOverrides
							}),
						),
						createElement(
							'div',
							{ style: { padding: '0 10px 20px' } },
							createElement(
								'a',
								{
									target: '_blank',
									href: 'https://docs.add-to-calendar-pro.com/' + atcbLanguageSlug + 'integration/wordpress.html',
								},
								window.atcbI18nObj.help
							)
						)
					)
				:
					createElement(
						'div',
						{},
						createElement(
							'div',
							{ style: { padding: '10px' } },
							createElement( TextControl, {
								label: window.atcbI18nObj.label_name,
								value: attributes.name,
								onChange: atcbUpdateName
							})
						),
						createElement(
							'div',
							{ style: { padding: '10px' } },
							createElement( 'label', {
								for: 'atcb-options',
								style: { fontSize: '11px', fontWeight: 500, lineHeight: 1.4, textTransform: 'uppercase', display: 'inline-block', marginBottom: '8px', padding: 0 }
							}, window.atcbI18nObj.label_options),
							createElement( MyMultiSelect, {
								options: selectOptions,
								value: attributes.options.map(option => selectOptions.find(o => o.value === option.toLowerCase().replace(/microsoft/g, 'ms').replace(/\s|\./g, ''))), // replacement for better backwards compatibility
								onChange: atcbUpdateOptions
							})
						),
						createElement(
							'div',
							{ style: { padding: '10px' } },
							createElement( TextareaControl, {
								label: window.atcbI18nObj.label_others,
								value: attributes.content,
								rows: 5,
								onChange: atcbUpdateOtherParams
							}),
							createElement(
								'div',
								{ style: { paddingBottom: '20px' } },
								createElement(
									'a',
									{
										target: '_blank',
										href: 'https://add-to-calendar-button.com/' + atcbLanguageSlug + 'configuration',
									},
									window.atcbI18nObj.help
								)
							)
						)
					),
				createElement(
					'div',
					{
						style: {
							padding: '10px 10px 15px',
							fontWeight: '600',
							fontStyle: 'italic',
						},
					},
					window.atcbI18nObj.note + '!' + (attributes.dynamicdateoverride !== 'no' ? ' ' + window.atcbI18nObj.note_dynamic + '.' : '')
				)
			),
			createElement( 'add-to-calendar-button', {
				...atcbEditorAttr,
				...atcbParseAttributes( attributes, attributes.isPro ? attributes.prooverrides : attributes.content ),
			} ),
		];
	},
	save: function ( props ) {
		const { attributes } = props;
    const tagAttributes = atcbParseAttributes( attributes, attributes.isPro ? attributes.prooverrides : attributes.content );
    // construct the shortcode string
    let shortcode = `[add-to-calendar-button`;
    // add attributes
		Object.keys(tagAttributes).forEach(key => {
			if (tagAttributes[key]) {
				// replace any quotes with &quot; to avoid conflicts with the shortcode
				tagAttributes[key] = tagAttributes[key].replace(/"/g, '&quot;');
				shortcode += ` ${key}="${tagAttributes[key]}"`;
			}
		});
    shortcode += `]`;
    return shortcode;
	},
} );
