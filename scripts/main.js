//
// Blocks the form submission if the checks have failed.
//
const forms = document.querySelectorAll( ".needs-validation" );

for ( const form of forms.values() )
{
	form.addEventListener( "submit", function ( event )
	{
		// Checks the validity of the HTML checks.
		if ( !form.checkValidity() )
		{
			// Blocks the default behaviour and stops the execution
			//	of other events with the same name.
			event.preventDefault();
			event.stopPropagation();
		}

		// Apply the Bootstrap style to form elements.
		const inputs = document.querySelectorAll( ".form-floating" );

		for ( const input of inputs.values() )
		{
			input.classList.add( "was-validated" );
		}
	}, false );
}