//
// Route vers la page principale du site.
//  Source : https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages
//

// Affichage de la page.
export default async function Page()
{
	// Affichage du rendu HTML de la page.
	return (
		<>
			<section>
				<h1>
					Test
					<span>Test1</span>
					<span>Test2</span>
				</h1>
			</section>

			<section>
				<h2>Test</h2>

				<p>Test</p>
			</section>
		</>
	);
}