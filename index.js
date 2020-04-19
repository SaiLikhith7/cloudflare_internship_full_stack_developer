
/**************************************************************************************************
* Title       - Cloudflare - internship-application-fullstack                                     *
* File        - index.js                                                                          *
* Description - The code performs the below matrix operations -                                   *
*               a. Request the URLs from the API                                                  *
*               b. Request a (random: see #3) variant                                             *
*               c. Distribute requests between variants (A/B testing style)                       *
*               d. Changing copy/URLs                                                             *
*               e. Persisting variants                                                            *
* Reference   - https://github.com/cloudflare-internship-2020/internship-application-fullstack    *
* Author      - Sai Likhith Kanuparthi (sailikhithk)                                              *
* Editor      - Atom                                                                              *
* Published at Worker  - https://cloudflare.sailikhithk.workers.dev                               *
* Domain Name - sailikhithk.codes (bought from name.com)                                                                 *
* Alias Website - https://www.sailikhithk.codes                                                   *                                             *
*                                                                                                 *
**************************************************************************************************/

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */


//URL to make fetch request and parse as JSON
const url = 'https://cfw-takehome.developers.workers.dev/api/variants';

async function handleRequest(request) {

	let resp1 = null;
  let variant = -1;


  let resp = await fetch(url);  //Fetching mail URL
	const data = await resp.json(); // Parsing to JSON

  // Defining constant variables for 2 variants of URL - to be used to check cookies
	const URL_1 = data.variants[0];
  const URL_2 = data.variants[1];

  //Check for cookies
  const cookie_url = request.headers.get('cookie');
  url_cookie = (cookie_url) ? cookie_url.split('=>')[1] : null; //Spliting cookies to get one of the variant URLs


  //Persisting variants
  if (cookie_url && (url_cookie == URL_1 || url_cookie == URL_2)){
   	resp1 = await fetch(url_cookie);
   	variant = data.variants.indexOf(url_cookie);
  }
  //When user hits URL for the first time, variant selected in A/B style
  else{
   	let ab_split_url = (Math.random() > 0.5 ? data.variants[0]: data.variants[1]);
  	resp1 = await fetch(ab_split_url);
  	resp1 = new Response(resp1.body,resp1);
  	resp1.headers.set('Set-Cookie',`cookie-url=>${ab_split_url}`);
  	variant = data.variants.indexOf(ab_split_url);
  }


  // Changes in the HTML content of the variants #Extra Credit
  return  new HTMLRewriter().on('a', new AttributeRewriter('href'))
  							            .on('title',new AttributeRewriter(null,'title',variant))
  							            .on('h1',new AttributeRewriter(null,'h1',variant))
  							            .on('p',new AttributeRewriter(null,'p',variant))
                            .transform(resp1)

}

// Class to perform Changes in the HTML content of the variants
class AttributeRewriter {
  constructor(attributeName,tag,variant) {
    this.attributeName = attributeName
    this.tag = tag
    this.variant = variant
  }

  // For the tag attributes
  element(element) {

    const attribute = element.getAttribute(this.attributeName)
    if (attribute) {
      element.setAttribute(
        this.attributeName,
        attribute.replace(attribute, 'https://github.com/SaiLikhith7/cloudflare_internship_full_stack_developer'),
      )
    }
  }

  //For text of the tags
  text(text){

  	if (this.tag == 'title' && this.variant  == 0){
  		if (!text.lastInTextNode)
  			text.replace(' sailikhithk Cloudflare - Variant 1');
  	}

  	else if (this.tag == 'title' && this.variant  == 1){
  		if (!text.lastInTextNode)
  			text.replace(' sailikhithk Cloudflare - Variant 2');
  	}

  	else if (this.tag == 'h1' && this.variant  == 0){
  		if (!text.lastInTextNode)
  			text.replace(' sailikhithk - Variant 1');
  	}

  	else if (this.tag == 'h1' && this.variant  == 1){
  		if (!text.lastInTextNode)
  			text.replace(' sailikhithk - Variant 2');
  	}

  	else if (this.tag == 'p' && this.variant  == 0){
  		if (!text.lastInTextNode)
  			text.replace(' sailikhithk\'s variant 1 of the take home project!');
  	}

  	else if (this.tag == 'p' && this.variant  == 1){
  		if (!text.lastInTextNode)
  			text.replace('sailikhithk\'s variant 2 of the take home project!');
  	}

  	else{
  		if (!text.lastInTextNode){
  		text.replace('Go to sailikhithk\'s Github Cloudflare Repository')
  	}
  	}
  }
}
