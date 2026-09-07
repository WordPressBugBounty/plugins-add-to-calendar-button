// Import necessary WordPress packages
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import { createElement } from '@wordpress/element';
import { CheckboxControl, SelectControl, ToggleControl, TextControl, TextareaControl } from '@wordpress/components';

// Retrieve the language and settings from the global object
const atcbNormalizeField = (field) => field.replace(/[-_]/g, '').toLowerCase();
const allowedFields = window.atcbSettings.allowedAttributes.map(atcbNormalizeField);
const atcbDefaultTimeZone = window.atcbSettings.defaultTimeZone;
const atcbDefaultTitle = window.atcbSettings.defaultTitle;
const atcbStyleSource = window.atcbSettings.styleSource;
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

// Validate aliases while preserving their spelling in the generated shortcode.
const atcbValidateField = (field) => allowedFields.includes(atcbNormalizeField(field.replace(/^(mf|sc|acf)-/i, '')));
const atcbFindField = (attributes, field) => Object.keys(attributes).find((key) => atcbNormalizeField(key) === field);

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
	if ( atcbLanguage != 'en' && atcbLanguage != '' ) {
		return 'language="' + atcbLanguage + '"';
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
		fill: 'none',
		stroke: 'currentColor',
		strokeWidth: 1.7,
		strokeLinecap: 'round',
		strokeLinejoin: 'round',
		style: { fill: 'none' },
	},
	createElement( 'rect', {
		x: 3,
		y: 4.5,
		width: 18,
		height: 17,
		rx: 3.5,
		style: { fill: '#fff' },
	} ),
	createElement( 'path', {
		d: 'M8 2.5v4M16 2.5v4M3 10.5h18M12 13.5v5M9.5 16h5',
		style: { fill: 'none' },
	} )
);

// global function to parse the input
function atcbParseAttributes( attributes, overrides, overridesOnly = false ) {
	// parse attributes from "overrides"
	const pattern = /([A-Za-z][\w-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'))?/g;
	let match;
	const parsedAttributes = {};
	while ( ( match = pattern.exec( overrides ) ) !== null ) {
		// parsing the attributes, except for unkown attribute, which cannot be used and would even throw an error in some cases (e.g. style)
		if ( match[1] && atcbValidateField(match[1]) ) {
			if ( match[3] !== undefined ) {
				parsedAttributes[ match[1] ] = match[3];
			} else if ( match[2] !== undefined ) {
				parsedAttributes[ match[1] ] = match[2];
			} else {
				parsedAttributes[ match[1] ] = "true";
			}
		}
	}
	// for description, dates, and customLabels, we replace any [ with { and any ] with } to avoid conflicts with the shortcode
	const descriptionKey = atcbFindField(parsedAttributes, 'description');
	const datesKey = atcbFindField(parsedAttributes, 'dates');
	const customLabelsKey = atcbFindField(parsedAttributes, 'customlabels');
	if ( descriptionKey ) {
		parsedAttributes[descriptionKey] = parsedAttributes[descriptionKey].replace( /\[/g, '{' ).replace( /\]/g, '}' );
	}
	if ( datesKey ) {
		// for dates, we also need to make sure the JSON stays valid
		parsedAttributes[datesKey] = parsedAttributes[datesKey].replace( /\[/g, '{' ).replace( /\]/g, '}' ).replace( /^{{/, '{' ).replace( /}}$/, '}' );
	}
	if ( customLabelsKey ) {
		parsedAttributes[customLabelsKey] = parsedAttributes[customLabelsKey].replace( /\[/g, '{' ).replace( /\]/g, '}' );
	}
	if (overridesOnly) return parsedAttributes; // return early if this is only for overrides
	// validating whether prokey, name, and options are already set and only take the explicit fields, if not
	if ( attributes.isPro && !atcbFindField(parsedAttributes, 'prokey') && attributes.prokey && attributes.prokey !== '' ) {
		// only add if valid UUID
		if ( attributes.prokey.match( /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}/ ) ) {
			parsedAttributes['prokey'] = attributes.prokey;
		}
	}
	if (!attributes.isPro) {
		if ( !atcbFindField(parsedAttributes, 'name') && attributes.name && attributes.name !== '' ) {
			parsedAttributes['name'] = attributes.name;
		}
		if ( !atcbFindField(parsedAttributes, 'options') && attributes.options) {
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
	apiVersion: 3,
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
		content: { type: 'string', default: `start-date="${ atcbDefaultDate }"\ntime-zone="${ atcbDefaultTimeZone }"\nbutton-style="round"\nlist-style="overlay"\nforce-overlay\n${ atcbDefaultLanguage }` },
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
		const blockProps = useBlockProps();
		if (!attributes.isPro && window.atcbSettings && window.atcbSettings.isProActive) {
			setAttributes( { isPro: true } );
		}
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
			const nameKey = atcbFindField(inputContentAttributes, 'name');
			const prokeyKey = atcbFindField(inputContentAttributes, 'prokey');
			const optionsKey = atcbFindField(inputContentAttributes, 'options');
			if ( nameKey && inputContentAttributes[nameKey] !== '' && !attributes.isPro ) {
				setAttributes( { name: inputContentAttributes[nameKey] } );
			}
			if ( prokeyKey && inputContentAttributes[prokeyKey] !== '' && attributes.isPro ) {
				setAttributes( { prokey: inputContentAttributes[prokeyKey] } );
			}
			if ( optionsKey && inputContentAttributes[optionsKey] !== '' && !attributes.isPro ) {
				const optionsInput = inputContentAttributes[optionsKey].replace( /[\['"\]]/g, '' ).toLowerCase().replace(/microsoft/g, 'ms').replace(/\s|\./g, '').split( ',' );
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
		function atcbUpdateOption( option, checked ) {
			const currentOptions = attributes.options.map(value => value.toLowerCase().replace(/microsoft/g, 'ms').replace(/\s|\./g, ''));
			setAttributes( {
				options: checked ? (currentOptions.includes(option) ? currentOptions : [...currentOptions, option]) : currentOptions.filter(value => value !== option),
			} );
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
							createElement(
								'fieldset',
								{ style: { border: 0, margin: 0, padding: 0 } },
								createElement(
									'legend',
									{ style: { fontSize: '11px', fontWeight: 500, lineHeight: 1.4, textTransform: 'uppercase', marginBottom: '8px' } },
									window.atcbI18nObj.label_options
								),
								...selectOptions.map(option => createElement( CheckboxControl, {
									key: option.value,
									label: option.label,
									checked: attributes.options.some(value => value.toLowerCase().replace(/microsoft/g, 'ms').replace(/\s|\./g, '') === option.value),
									onChange: checked => atcbUpdateOption(option.value, checked),
								}) )
							)
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
			createElement(
				'div',
				blockProps,
				createElement( 'add-to-calendar-button', {
					...atcbEditorAttr,
					...atcbParseAttributes( attributes, attributes.isPro ? attributes.prooverrides : attributes.content ),
					'style-source': atcbStyleSource,
				} )
			),
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
				shortcode += ` ${key.toLowerCase()}="${tagAttributes[key]}"`;
			}
		});
    shortcode += `]`;
    return shortcode;
	},
} );
