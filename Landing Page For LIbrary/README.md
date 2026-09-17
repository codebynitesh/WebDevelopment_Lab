 Open Pages — Library Landing Page

## About the Project

Open Pages is a simple library landing page made with HTML and CSS. It introduces a fictional library, shows featured books, and provides visiting information.

This beginner project demonstrates how to create sections, arrange content in columns, add images, and style a page for different screen sizes.

## Features

- Header with the library name and navigation links.
- Welcome section with a heading, description, and library image.
- Three library services: borrowing books, reading and studying, and learning together.
- Featured books with titles, authors, and short descriptions.
- About section introducing the library.
- Visiting section with a sample address and opening hours.
- Footer with a link back to the top.
- Responsive layout that adjusts to phone and computer screens.

## Technologies Used

- **HTML:** Creates the page content and structure.
- **CSS:** Controls colours, fonts, spacing, borders, and layout.

The project does not use JavaScript, Firebase, Python, or a database.

## Project Files

```text
library-landing-page/
├── index.html
├── style.css
├── library.jpg
└── README.md
```

| File | Purpose |
| --- | --- |
| `index.html` | Contains the headings, text, image, book cards, and links. |
| `style.css` | Controls the design and small-screen layout. |
| `library.jpg` | The library image shown in the welcome section. |
| `README.md` | Explains the project. It is not needed to run the website. |

## How to Open the Project

1. Download and extract the project ZIP.
2. Open the extracted folder.
3. Keep `index.html`, `style.css`, and `library.jpg` together.
4. Double-click `index.html` to open the page in a browser.

No installation, running server, or internet connection is needed to view the downloaded page.

You can also open the folder in VS Code and use Live Server while editing, but this is optional.

## How the Code Works

### HTML

- `<header>` contains the library name and navigation.
- `<main>` contains the main page content.
- `<section>` separates the different parts of the page.
- `<article>` groups the information for each featured book.
- `<img>` displays the library image.
- `<footer>` contains the bottom part of the page.

Navigation links point to section IDs. For example:

```html
<a href="#books">Books</a>
```

Clicking this link moves to the section with `id="books"`.

### CSS

- **Grid** arranges content and book cards into columns.
- **Flexbox** aligns navigation links and other rows.
- **Padding** adds space inside an element.
- **Margin** adds space outside an element.
- **Media queries** adjust the layout on smaller screens.

## How to Customise It

1. Open the files in a text editor such as VS Code.
2. Change the library name, descriptions, book details, address, and hours in `index.html`.
3. Change colours, font sizes, and spacing in `style.css`.
4. Replace `library.jpg` with your own image if wanted. Update the image filename and `alt` description in HTML if needed.
5. Save the files and refresh the browser to see your changes.

## Things to Test

- Click Home, Books, About us, and Visit us in the navigation.
- Check that Explore the books moves to the featured-books section.
- Check that Ask about borrowing moves to the visiting section.
- Click Back to top in the footer.
- Confirm that the image loads.
- Resize the browser to check the phone layout and make sure content does not overlap.

## Important Notes

- Open Pages is a fictional library. The address and opening hours are sample details.
- The featured books are reading suggestions, not a live inventory.
- This is a landing page, not a library management system. It does not support online borrowing, reservations, catalogue search, or user accounts.