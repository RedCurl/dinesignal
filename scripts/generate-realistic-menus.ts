/**
 * generate-realistic-menus.ts
 *
 * Generates highly realistic menu data based on restaurant info from Google Places
 * or the existing app data. Uses cuisine-specific item banks with price variance.
 *
 * Usage:
 *   npx tsx scripts/generate-realistic-menus.ts              # reads scripts/output/restaurants.json
 *   npx tsx scripts/generate-realistic-menus.ts --from-app   # reads src/data/restaurants.ts (no API needed)
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// ─── CLI Args ────────────────────────────────────────────────

const FROM_APP = process.argv.includes('--from-app');

// ─── Types ───────────────────────────────────────────────────

interface BaseMenuItem {
  name: string;
  basePrice: number;
  description: string;
  subcategory: string;
}

interface CuisineMenu {
  appetizers: BaseMenuItem[];
  entrees: BaseMenuItem[];
  sides: BaseMenuItem[];
  drinks: BaseMenuItem[];
  desserts: BaseMenuItem[];
}

type MenuCategory = 'appetizer' | 'entree' | 'side' | 'drink' | 'dessert';

interface RestaurantInput {
  // From Google Places JSON
  place_id?: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  user_ratings_total?: number;
  review_count?: number;
  price_level?: number;
  price_tier?: number;
  types?: string[];
  cuisine_type?: string;
  metro_area?: string;
}

interface GeneratedMenuItem {
  restaurant_id: string;
  restaurant_name: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  subcategory: string;
  source: string;
}

// ─── Cuisine Item Banks ──────────────────────────────────────
// At least 15+ items per cuisine, realistic names and prices

const CUISINE_MENUS: Record<string, CuisineMenu> = {
  italian: {
    appetizers: [
      { name: 'Bruschetta al Pomodoro', basePrice: 12, description: 'Grilled bread with fresh tomatoes, basil, and extra virgin olive oil', subcategory: 'bread' },
      { name: 'Caprese Salad', basePrice: 14, description: 'Fresh mozzarella, heirloom tomatoes, basil, balsamic reduction', subcategory: 'salad' },
      { name: 'Calamari Fritti', basePrice: 15, description: 'Crispy fried calamari with marinara and lemon aioli', subcategory: 'seafood' },
      { name: 'Antipasto Plate', basePrice: 16, description: 'Cured meats, marinated vegetables, olives, and artisan cheeses', subcategory: 'charcuterie' },
      { name: 'Arancini', basePrice: 13, description: 'Crispy risotto balls stuffed with mozzarella, served with pomodoro', subcategory: 'fried' },
      { name: 'Carpaccio di Manzo', basePrice: 17, description: 'Thinly sliced raw beef with arugula, capers, and shaved Parmigiano', subcategory: 'raw' },
    ],
    entrees: [
      { name: 'Margherita Pizza', basePrice: 16, description: 'San Marzano tomatoes, fresh mozzarella, basil on wood-fired crust', subcategory: 'pizza' },
      { name: 'Pasta Carbonara', basePrice: 18, description: 'Spaghetti with guanciale, egg yolk, Pecorino Romano, black pepper', subcategory: 'pasta' },
      { name: 'Chicken Parmesan', basePrice: 22, description: 'Breaded chicken breast with marinara and melted mozzarella over spaghetti', subcategory: 'chicken' },
      { name: 'Risotto ai Funghi', basePrice: 20, description: 'Arborio rice with wild mushrooms, truffle oil, and Parmigiano', subcategory: 'risotto' },
      { name: 'Lasagna Bolognese', basePrice: 19, description: 'Layered pasta with beef and pork ragu, bechamel, and mozzarella', subcategory: 'pasta' },
      { name: 'Fettuccine Alfredo', basePrice: 17, description: 'Fresh fettuccine tossed in butter and Parmigiano-Reggiano cream', subcategory: 'pasta' },
      { name: 'Osso Buco', basePrice: 32, description: 'Braised veal shank with gremolata and saffron risotto', subcategory: 'meat' },
      { name: 'Branzino al Forno', basePrice: 28, description: 'Oven-roasted Mediterranean sea bass with lemon and herbs', subcategory: 'seafood' },
      { name: 'Penne all\'Arrabbiata', basePrice: 16, description: 'Penne with spicy tomato sauce, garlic, and red chili flakes', subcategory: 'pasta' },
      { name: 'Veal Piccata', basePrice: 26, description: 'Pan-seared veal medallions with lemon-caper butter sauce', subcategory: 'meat' },
    ],
    sides: [
      { name: 'Garlic Bread', basePrice: 7, description: 'Toasted ciabatta with roasted garlic butter and herbs', subcategory: 'bread' },
      { name: 'Caesar Salad', basePrice: 12, description: 'Romaine, house-made dressing, croutons, shaved Parmigiano', subcategory: 'salad' },
      { name: 'Sauteed Broccolini', basePrice: 9, description: 'With garlic, chili flakes, and olive oil', subcategory: 'vegetable' },
    ],
    drinks: [
      { name: 'Italian Sparkling Water', basePrice: 5, description: 'San Pellegrino 750ml', subcategory: 'water' },
      { name: 'Espresso', basePrice: 4, description: 'Double shot Italian espresso', subcategory: 'coffee' },
      { name: 'Limoncello Spritz', basePrice: 13, description: 'Limoncello, prosecco, soda water, fresh lemon', subcategory: 'cocktail' },
    ],
    desserts: [
      { name: 'Tiramisu', basePrice: 12, description: 'Classic espresso-soaked ladyfingers with mascarpone cream', subcategory: 'pastry' },
      { name: 'Panna Cotta', basePrice: 11, description: 'Vanilla bean custard with seasonal berry compote', subcategory: 'custard' },
      { name: 'Cannoli', basePrice: 10, description: 'Crispy shells filled with sweet ricotta and chocolate chips', subcategory: 'pastry' },
    ],
  },

  mexican: {
    appetizers: [
      { name: 'Guacamole Fresco', basePrice: 12, description: 'Tableside guacamole with tortilla chips', subcategory: 'dip' },
      { name: 'Queso Fundido', basePrice: 13, description: 'Melted Oaxacan cheese with chorizo and flour tortillas', subcategory: 'cheese' },
      { name: 'Elote', basePrice: 8, description: 'Grilled Mexican street corn with mayo, cotija, chili, and lime', subcategory: 'vegetable' },
      { name: 'Ceviche Tostada', basePrice: 14, description: 'Fresh fish cured in lime with avocado, cilantro, and serrano', subcategory: 'seafood' },
      { name: 'Nachos Supreme', basePrice: 14, description: 'Loaded tortilla chips with beans, cheese, pico, sour cream, and jalapenos', subcategory: 'fried' },
      { name: 'Chicken Flautas', basePrice: 12, description: 'Crispy rolled tacos with shredded chicken, crema, and salsa verde', subcategory: 'fried' },
    ],
    entrees: [
      { name: 'Carne Asada Plate', basePrice: 22, description: 'Grilled marinated skirt steak with rice, beans, and pico de gallo', subcategory: 'beef' },
      { name: 'Carnitas Tacos', basePrice: 15, description: 'Three slow-cooked pork tacos with onion, cilantro, and salsa', subcategory: 'taco' },
      { name: 'Chicken Enchiladas', basePrice: 16, description: 'Three corn tortillas with shredded chicken, red sauce, and cheese', subcategory: 'traditional' },
      { name: 'Fish Tacos', basePrice: 16, description: 'Beer-battered cod with cabbage slaw, chipotle crema, and lime', subcategory: 'taco' },
      { name: 'Burrito Grande', basePrice: 14, description: 'Flour tortilla stuffed with carne asada, rice, beans, cheese, and guacamole', subcategory: 'burrito' },
      { name: 'Chile Relleno', basePrice: 17, description: 'Roasted poblano stuffed with cheese, topped with ranchero sauce', subcategory: 'traditional' },
      { name: 'Mole Poblano', basePrice: 19, description: 'Chicken in rich chocolate-chili mole sauce with rice and beans', subcategory: 'traditional' },
      { name: 'Al Pastor Tacos', basePrice: 15, description: 'Three spit-roasted pork tacos with pineapple, onion, and cilantro', subcategory: 'taco' },
      { name: 'Shrimp Fajitas', basePrice: 20, description: 'Sizzling shrimp with peppers and onions, served with tortillas', subcategory: 'fajita' },
      { name: 'Chicken Quesadilla', basePrice: 14, description: 'Grilled flour tortilla with chicken, Oaxacan cheese, and peppers', subcategory: 'quesadilla' },
    ],
    sides: [
      { name: 'Mexican Rice', basePrice: 5, description: 'Traditional tomato-seasoned rice', subcategory: 'grain' },
      { name: 'Refried Beans', basePrice: 5, description: 'Creamy pinto beans with cotija cheese', subcategory: 'beans' },
      { name: 'Chips & Salsa', basePrice: 6, description: 'House-made tortilla chips with salsa roja and salsa verde', subcategory: 'snack' },
    ],
    drinks: [
      { name: 'Horchata', basePrice: 5, description: 'Traditional rice milk with cinnamon and vanilla', subcategory: 'non-alcoholic' },
      { name: 'Classic Margarita', basePrice: 13, description: 'Tequila, fresh lime, triple sec, salt rim', subcategory: 'cocktail' },
      { name: 'Jarritos', basePrice: 4, description: 'Mexican fruit soda — tamarind, mandarin, or lime', subcategory: 'soda' },
    ],
    desserts: [
      { name: 'Churros con Chocolate', basePrice: 10, description: 'Crispy cinnamon-sugar churros with chocolate dipping sauce', subcategory: 'fried' },
      { name: 'Tres Leches Cake', basePrice: 11, description: 'Three-milk sponge cake with whipped cream and berries', subcategory: 'cake' },
      { name: 'Flan', basePrice: 9, description: 'Classic Mexican caramel custard', subcategory: 'custard' },
    ],
  },

  japanese: {
    appetizers: [
      { name: 'Edamame', basePrice: 7, description: 'Steamed soybeans with sea salt', subcategory: 'vegetable' },
      { name: 'Gyoza', basePrice: 10, description: 'Pan-fried pork dumplings with dipping sauce', subcategory: 'dumpling' },
      { name: 'Hamachi Tartare', basePrice: 16, description: 'Diced yellowtail with avocado, yuzu, and crispy wontons', subcategory: 'raw' },
      { name: 'Agedashi Tofu', basePrice: 9, description: 'Crispy silken tofu in warm dashi broth with bonito flakes', subcategory: 'tofu' },
      { name: 'Shishito Peppers', basePrice: 10, description: 'Blistered peppers with bonito flakes and ponzu', subcategory: 'vegetable' },
      { name: 'Takoyaki', basePrice: 11, description: 'Octopus fritters with takoyaki sauce, mayo, and bonito', subcategory: 'fried' },
    ],
    entrees: [
      { name: 'Salmon Sashimi', basePrice: 22, description: '12 pieces of premium fresh salmon sashimi', subcategory: 'sashimi' },
      { name: 'Chirashi Bowl', basePrice: 26, description: 'Assorted sashimi over seasoned sushi rice', subcategory: 'sushi' },
      { name: 'Tonkotsu Ramen', basePrice: 18, description: 'Rich pork bone broth with chashu, soft egg, nori, and scallions', subcategory: 'ramen' },
      { name: 'Dragon Roll', basePrice: 17, description: 'Shrimp tempura roll topped with avocado and eel sauce', subcategory: 'sushi' },
      { name: 'Chicken Katsu Curry', basePrice: 18, description: 'Crispy breaded chicken with Japanese curry sauce over rice', subcategory: 'curry' },
      { name: 'Wagyu Donburi', basePrice: 32, description: 'A5 wagyu beef over rice with truffle soy and soft egg', subcategory: 'rice bowl' },
      { name: 'Black Cod Miso', basePrice: 34, description: 'Miso-marinated black cod, broiled to perfection', subcategory: 'seafood' },
      { name: 'Spicy Tuna Roll', basePrice: 14, description: 'Fresh tuna with spicy mayo, cucumber, and sesame', subcategory: 'sushi' },
      { name: 'Teriyaki Salmon', basePrice: 22, description: 'Grilled salmon fillet with house teriyaki glaze and steamed rice', subcategory: 'seafood' },
      { name: 'Udon Tempura', basePrice: 16, description: 'Thick wheat noodles in dashi broth with shrimp and vegetable tempura', subcategory: 'noodle' },
    ],
    sides: [
      { name: 'Miso Soup', basePrice: 4, description: 'Traditional miso with tofu, wakame, and scallions', subcategory: 'soup' },
      { name: 'Seaweed Salad', basePrice: 7, description: 'Marinated wakame with sesame dressing', subcategory: 'salad' },
      { name: 'Steamed Rice', basePrice: 3, description: 'Japanese short-grain rice', subcategory: 'grain' },
    ],
    drinks: [
      { name: 'Japanese Green Tea', basePrice: 4, description: 'Hot sencha green tea', subcategory: 'tea' },
      { name: 'Ramune Soda', basePrice: 5, description: 'Classic Japanese marble soda', subcategory: 'soda' },
      { name: 'Sake Flight', basePrice: 18, description: 'Three premium sake selections', subcategory: 'alcohol' },
    ],
    desserts: [
      { name: 'Mochi Ice Cream', basePrice: 8, description: 'Three assorted mochi ice cream flavors', subcategory: 'frozen' },
      { name: 'Matcha Cheesecake', basePrice: 10, description: 'Light Japanese-style cheesecake with matcha', subcategory: 'cake' },
      { name: 'Black Sesame Creme Brulee', basePrice: 11, description: 'Rich custard with toasted black sesame', subcategory: 'custard' },
    ],
  },

  american: {
    appetizers: [
      { name: 'Crispy Calamari', basePrice: 14, description: 'Lightly breaded calamari with lemon aioli and marinara', subcategory: 'fried' },
      { name: 'Loaded Potato Skins', basePrice: 13, description: 'Crispy potato halves with cheddar, bacon, and sour cream', subcategory: 'potato' },
      { name: 'Truffle Fries', basePrice: 12, description: 'Crispy fries with truffle oil, Parmesan, and fresh herbs', subcategory: 'fried' },
      { name: 'Wedge Salad', basePrice: 14, description: 'Iceberg lettuce with blue cheese, bacon, tomatoes, and ranch', subcategory: 'salad' },
      { name: 'Chicken Wings', basePrice: 15, description: 'Crispy wings tossed in buffalo, BBQ, or garlic Parmesan', subcategory: 'wings' },
      { name: 'Crab Cake', basePrice: 18, description: 'Pan-seared jumbo lump crab cake with remoulade', subcategory: 'seafood' },
    ],
    entrees: [
      { name: 'Dry-Aged Ribeye', basePrice: 48, description: '14oz dry-aged Prime ribeye with compound butter', subcategory: 'steak' },
      { name: 'Pan-Seared Salmon', basePrice: 28, description: 'Wild salmon with lemon-dill butter, asparagus, and fingerling potatoes', subcategory: 'seafood' },
      { name: 'Wood-Fired Chicken', basePrice: 24, description: 'Half roasted chicken with herb jus and seasonal vegetables', subcategory: 'chicken' },
      { name: 'Classic Burger', basePrice: 18, description: 'Angus beef patty with lettuce, tomato, onion, and house sauce on brioche', subcategory: 'burger' },
      { name: 'Mushroom Risotto', basePrice: 22, description: 'Creamy Arborio rice with wild mushrooms and truffle oil', subcategory: 'risotto' },
      { name: 'Braised Short Ribs', basePrice: 34, description: 'Slow-braised beef short ribs with red wine reduction and polenta', subcategory: 'beef' },
      { name: 'Grilled Pork Chop', basePrice: 28, description: 'Double-cut pork chop with apple chutney and mashed potatoes', subcategory: 'pork' },
      { name: 'Pan-Seared Trout', basePrice: 26, description: 'Ruby trout with brown butter, almonds, and green beans', subcategory: 'seafood' },
      { name: 'Mac & Cheese', basePrice: 16, description: 'Three-cheese baked macaroni with breadcrumb crust', subcategory: 'comfort' },
      { name: 'New York Strip', basePrice: 44, description: '12oz Prime New York strip with peppercorn sauce', subcategory: 'steak' },
    ],
    sides: [
      { name: 'Mashed Potatoes', basePrice: 8, description: 'Yukon Gold potatoes whipped with butter and cream', subcategory: 'potato' },
      { name: 'Grilled Asparagus', basePrice: 9, description: 'With lemon zest and olive oil', subcategory: 'vegetable' },
      { name: 'Creamed Spinach', basePrice: 8, description: 'Classic steakhouse creamed spinach', subcategory: 'vegetable' },
    ],
    drinks: [
      { name: 'Craft Lemonade', basePrice: 5, description: 'Fresh-squeezed with lavender or raspberry', subcategory: 'non-alcoholic' },
      { name: 'Old Fashioned', basePrice: 15, description: 'Bourbon, bitters, orange peel, cherry', subcategory: 'cocktail' },
      { name: 'Iced Tea', basePrice: 4, description: 'House-brewed unsweetened black tea', subcategory: 'tea' },
    ],
    desserts: [
      { name: 'Chocolate Lava Cake', basePrice: 13, description: 'Warm molten chocolate cake with vanilla ice cream', subcategory: 'chocolate' },
      { name: 'New York Cheesecake', basePrice: 12, description: 'Classic creamy cheesecake with berry compote', subcategory: 'cake' },
      { name: 'Apple Pie a la Mode', basePrice: 11, description: 'Warm apple pie with cinnamon ice cream', subcategory: 'pie' },
    ],
  },

  indian: {
    appetizers: [
      { name: 'Samosa', basePrice: 8, description: 'Crispy pastry filled with spiced potatoes and peas, with tamarind chutney', subcategory: 'fried' },
      { name: 'Chicken Tikka', basePrice: 14, description: 'Tandoori-marinated chicken pieces with mint chutney', subcategory: 'tandoori' },
      { name: 'Vegetable Pakora', basePrice: 9, description: 'Assorted vegetables in spiced chickpea batter, deep-fried', subcategory: 'fried' },
      { name: 'Paneer Tikka', basePrice: 13, description: 'Grilled cottage cheese with peppers and onions in tandoori marinade', subcategory: 'tandoori' },
      { name: 'Aloo Tikki', basePrice: 9, description: 'Crispy spiced potato cakes with yogurt and chutneys', subcategory: 'fried' },
      { name: 'Papadum Basket', basePrice: 6, description: 'Crispy lentil wafers with three chutneys', subcategory: 'bread' },
    ],
    entrees: [
      { name: 'Chicken Tikka Masala', basePrice: 18, description: 'Tandoori chicken in creamy tomato-spice sauce', subcategory: 'curry' },
      { name: 'Lamb Rogan Josh', basePrice: 22, description: 'Slow-cooked lamb in Kashmiri chili and yogurt sauce', subcategory: 'curry' },
      { name: 'Palak Paneer', basePrice: 16, description: 'Cottage cheese cubes in creamy spinach sauce', subcategory: 'vegetarian' },
      { name: 'Butter Chicken', basePrice: 18, description: 'Tandoori chicken in rich tomato-butter cream sauce', subcategory: 'curry' },
      { name: 'Chicken Biryani', basePrice: 19, description: 'Fragrant basmati rice layered with spiced chicken and saffron', subcategory: 'rice' },
      { name: 'Chana Masala', basePrice: 15, description: 'Chickpeas in tangy tomato-onion gravy with cumin and coriander', subcategory: 'vegetarian' },
      { name: 'Lamb Vindaloo', basePrice: 21, description: 'Spicy Goan curry with tender lamb in vinegar-chili sauce', subcategory: 'curry' },
      { name: 'Shrimp Curry', basePrice: 20, description: 'Tiger shrimp in coconut-tomato curry with curry leaves', subcategory: 'seafood' },
      { name: 'Dal Makhani', basePrice: 15, description: 'Slow-cooked black lentils in butter and cream', subcategory: 'vegetarian' },
      { name: 'Tandoori Mixed Grill', basePrice: 24, description: 'Assorted tandoori chicken, lamb, and shrimp from the clay oven', subcategory: 'tandoori' },
    ],
    sides: [
      { name: 'Garlic Naan', basePrice: 4, description: 'Tandoor-baked flatbread with roasted garlic and butter', subcategory: 'bread' },
      { name: 'Basmati Rice', basePrice: 4, description: 'Steamed aged basmati rice', subcategory: 'grain' },
      { name: 'Raita', basePrice: 4, description: 'Cool yogurt with cucumber, mint, and cumin', subcategory: 'condiment' },
    ],
    drinks: [
      { name: 'Mango Lassi', basePrice: 6, description: 'Creamy yogurt smoothie with Alphonso mango', subcategory: 'non-alcoholic' },
      { name: 'Masala Chai', basePrice: 4, description: 'Spiced tea brewed with milk, cardamom, and ginger', subcategory: 'tea' },
      { name: 'Sweet Lassi', basePrice: 5, description: 'Traditional sweetened yogurt drink with rosewater', subcategory: 'non-alcoholic' },
    ],
    desserts: [
      { name: 'Gulab Jamun', basePrice: 8, description: 'Warm milk dumplings in cardamom-rose syrup', subcategory: 'traditional' },
      { name: 'Kheer', basePrice: 8, description: 'Creamy rice pudding with pistachios, almonds, and saffron', subcategory: 'pudding' },
      { name: 'Mango Kulfi', basePrice: 7, description: 'Indian-style frozen mango cream with pistachios', subcategory: 'frozen' },
    ],
  },

  thai: {
    appetizers: [
      { name: 'Satay Chicken', basePrice: 12, description: 'Grilled chicken skewers with peanut sauce and cucumber relish', subcategory: 'grilled' },
      { name: 'Tom Yum Soup', basePrice: 10, description: 'Hot and sour soup with shrimp, lemongrass, and galangal', subcategory: 'soup' },
      { name: 'Fresh Spring Rolls', basePrice: 9, description: 'Rice paper rolls with shrimp, herbs, and sweet chili sauce', subcategory: 'roll' },
      { name: 'Crispy Wontons', basePrice: 10, description: 'Fried wontons with cream cheese filling and sweet plum sauce', subcategory: 'fried' },
      { name: 'Larb Chicken', basePrice: 12, description: 'Spicy minced chicken salad with lime, mint, and toasted rice', subcategory: 'salad' },
      { name: 'Tom Kha Gai', basePrice: 11, description: 'Coconut chicken soup with galangal, lemongrass, and lime leaves', subcategory: 'soup' },
    ],
    entrees: [
      { name: 'Pad Thai', basePrice: 16, description: 'Stir-fried rice noodles with shrimp, bean sprouts, peanuts, and lime', subcategory: 'noodle' },
      { name: 'Green Curry', basePrice: 17, description: 'Coconut green curry with chicken, Thai basil, and bamboo shoots', subcategory: 'curry' },
      { name: 'Massaman Curry', basePrice: 18, description: 'Rich peanut curry with beef, potatoes, and onions', subcategory: 'curry' },
      { name: 'Basil Fried Rice', basePrice: 15, description: 'Wok-fried jasmine rice with Thai basil, chili, and choice of protein', subcategory: 'rice' },
      { name: 'Panang Curry', basePrice: 17, description: 'Thick red curry with chicken, kaffir lime leaves, and green beans', subcategory: 'curry' },
      { name: 'Pad See Ew', basePrice: 15, description: 'Wide rice noodles with Chinese broccoli, egg, and sweet soy', subcategory: 'noodle' },
      { name: 'Drunken Noodles', basePrice: 16, description: 'Spicy wide noodles with basil, chili, bell peppers, and chicken', subcategory: 'noodle' },
      { name: 'Crispy Whole Fish', basePrice: 26, description: 'Deep-fried whole snapper with three-flavor sauce', subcategory: 'seafood' },
      { name: 'Yellow Curry', basePrice: 16, description: 'Mild coconut curry with potatoes, onions, and chicken', subcategory: 'curry' },
      { name: 'Pineapple Fried Rice', basePrice: 16, description: 'Jasmine rice with pineapple, cashews, raisins, and curry powder', subcategory: 'rice' },
    ],
    sides: [
      { name: 'Jasmine Rice', basePrice: 3, description: 'Steamed Thai jasmine rice', subcategory: 'grain' },
      { name: 'Sticky Rice', basePrice: 4, description: 'Thai glutinous rice', subcategory: 'grain' },
      { name: 'Papaya Salad', basePrice: 10, description: 'Shredded green papaya with lime, chili, and dried shrimp', subcategory: 'salad' },
    ],
    drinks: [
      { name: 'Thai Iced Tea', basePrice: 5, description: 'Strong black tea with condensed milk and spices over ice', subcategory: 'tea' },
      { name: 'Coconut Water', basePrice: 5, description: 'Fresh young coconut water', subcategory: 'non-alcoholic' },
      { name: 'Lemongrass Ginger Ale', basePrice: 5, description: 'House-made lemongrass and ginger soda', subcategory: 'soda' },
    ],
    desserts: [
      { name: 'Mango Sticky Rice', basePrice: 10, description: 'Sweet coconut sticky rice with fresh Thai mango', subcategory: 'traditional' },
      { name: 'Coconut Ice Cream', basePrice: 8, description: 'House-made coconut ice cream with peanuts and condensed milk', subcategory: 'frozen' },
      { name: 'Banana Roti', basePrice: 9, description: 'Crispy Thai-style crepe with banana and condensed milk', subcategory: 'pastry' },
    ],
  },

  mediterranean: {
    appetizers: [
      { name: 'Hummus Plate', basePrice: 11, description: 'Creamy chickpea dip with olive oil, paprika, and warm pita', subcategory: 'dip' },
      { name: 'Falafel', basePrice: 12, description: 'Crispy chickpea fritters with tahini and pickled turnips', subcategory: 'fried' },
      { name: 'Grilled Halloumi', basePrice: 13, description: 'Pan-seared halloumi cheese with za\'atar, honey, and mint', subcategory: 'cheese' },
      { name: 'Spanakopita', basePrice: 11, description: 'Flaky phyllo pastry with spinach and feta filling', subcategory: 'pastry' },
      { name: 'Baba Ganoush', basePrice: 11, description: 'Smoky roasted eggplant dip with tahini and warm pita', subcategory: 'dip' },
      { name: 'Grilled Octopus', basePrice: 18, description: 'Charred tentacles with capers, olive oil, and lemon', subcategory: 'seafood' },
    ],
    entrees: [
      { name: 'Lamb Chops', basePrice: 34, description: 'Grilled Colorado lamb chops with lemon potatoes and tzatziki', subcategory: 'lamb' },
      { name: 'Chicken Shawarma Plate', basePrice: 18, description: 'Slow-roasted spiced chicken with rice, hummus, and salad', subcategory: 'chicken' },
      { name: 'Whole Branzino', basePrice: 30, description: 'Wood-grilled Mediterranean sea bass with lemon and herbs', subcategory: 'seafood' },
      { name: 'Lamb Kofta', basePrice: 20, description: 'Grilled ground lamb skewers with yogurt sauce and rice', subcategory: 'lamb' },
      { name: 'Moussaka', basePrice: 19, description: 'Layered eggplant and ground lamb with bechamel gratin', subcategory: 'traditional' },
      { name: 'Falafel Plate', basePrice: 16, description: 'Five falafel with hummus, tabbouleh, and warm pita', subcategory: 'vegetarian' },
      { name: 'Grilled Salmon', basePrice: 26, description: 'Atlantic salmon with herb chermoula and roasted vegetables', subcategory: 'seafood' },
      { name: 'Chicken Souvlaki', basePrice: 18, description: 'Marinated chicken skewers with tzatziki and Greek salad', subcategory: 'chicken' },
      { name: 'Steak Kebab', basePrice: 24, description: 'Grilled beef tenderloin skewers with peppers and onions', subcategory: 'beef' },
      { name: 'Vegetable Tagine', basePrice: 17, description: 'Slow-cooked vegetables in Moroccan spices with couscous', subcategory: 'vegetarian' },
    ],
    sides: [
      { name: 'Greek Salad', basePrice: 12, description: 'Tomato, cucumber, olive, feta, and red onion', subcategory: 'salad' },
      { name: 'Tabbouleh', basePrice: 8, description: 'Bulgur wheat with parsley, tomato, mint, and lemon', subcategory: 'salad' },
      { name: 'Roasted Potatoes', basePrice: 7, description: 'Lemon herb roasted fingerling potatoes', subcategory: 'potato' },
    ],
    drinks: [
      { name: 'Fresh Mint Lemonade', basePrice: 6, description: 'House-squeezed lemonade with fresh mint', subcategory: 'non-alcoholic' },
      { name: 'Turkish Coffee', basePrice: 5, description: 'Traditional finely-ground coffee with cardamom', subcategory: 'coffee' },
      { name: 'Pomegranate Spritzer', basePrice: 7, description: 'Sparkling water with pomegranate juice and lime', subcategory: 'non-alcoholic' },
    ],
    desserts: [
      { name: 'Baklava', basePrice: 10, description: 'Flaky phyllo with walnuts, pistachios, and honey syrup', subcategory: 'pastry' },
      { name: 'Loukoumades', basePrice: 10, description: 'Greek honey donuts with cinnamon and walnuts', subcategory: 'pastry' },
      { name: 'Kunafa', basePrice: 12, description: 'Crispy shredded phyllo with sweet cheese and rose-orange blossom syrup', subcategory: 'pastry' },
    ],
  },

  chinese: {
    appetizers: [
      { name: 'Xiao Long Bao', basePrice: 13, description: 'Steamed soup dumplings with pork and rich broth', subcategory: 'dumpling' },
      { name: 'Pot Stickers', basePrice: 11, description: 'Pan-fried pork dumplings with ginger-soy dipping sauce', subcategory: 'dumpling' },
      { name: 'Hot and Sour Soup', basePrice: 8, description: 'Classic soup with tofu, mushrooms, bamboo shoots, and egg', subcategory: 'soup' },
      { name: 'Scallion Pancake', basePrice: 9, description: 'Crispy pan-fried flatbread with scallions', subcategory: 'bread' },
      { name: 'Wonton Soup', basePrice: 10, description: 'Pork and shrimp wontons in clear chicken broth', subcategory: 'soup' },
      { name: 'Cucumber Salad', basePrice: 8, description: 'Smashed cucumbers with chili oil, garlic, and vinegar', subcategory: 'salad' },
    ],
    entrees: [
      { name: 'Kung Pao Chicken', basePrice: 17, description: 'Wok-fried chicken with peanuts, chili peppers, and Sichuan peppercorn', subcategory: 'chicken' },
      { name: 'Mapo Tofu', basePrice: 15, description: 'Silken tofu in spicy chili bean sauce with minced pork', subcategory: 'tofu' },
      { name: 'Beef Noodle Soup', basePrice: 17, description: 'Braised beef in rich broth with hand-pulled noodles and bok choy', subcategory: 'noodle' },
      { name: 'Orange Chicken', basePrice: 16, description: 'Crispy chicken pieces in sweet-tangy orange glaze', subcategory: 'chicken' },
      { name: 'Mongolian Beef', basePrice: 18, description: 'Sliced flank steak with scallions in savory-sweet sauce', subcategory: 'beef' },
      { name: 'Shrimp with Lobster Sauce', basePrice: 19, description: 'Large shrimp in egg-based lobster sauce with peas', subcategory: 'seafood' },
      { name: 'Dan Dan Noodles', basePrice: 15, description: 'Sichuan noodles with chili oil, peanuts, and minced pork', subcategory: 'noodle' },
      { name: 'Sweet and Sour Pork', basePrice: 16, description: 'Crispy pork pieces with pineapple and bell peppers in tangy sauce', subcategory: 'pork' },
      { name: 'Peking Duck', basePrice: 42, description: 'Whole roasted duck with pancakes, scallions, and hoisin sauce', subcategory: 'duck' },
      { name: 'Fried Rice', basePrice: 14, description: 'Wok-fried rice with egg, scallions, and choice of protein', subcategory: 'rice' },
    ],
    sides: [
      { name: 'Steamed White Rice', basePrice: 3, description: 'Jasmine rice', subcategory: 'grain' },
      { name: 'Stir-Fried Bok Choy', basePrice: 10, description: 'Baby bok choy with garlic and oyster sauce', subcategory: 'vegetable' },
      { name: 'Egg Drop Soup', basePrice: 6, description: 'Light chicken broth with silky egg ribbons', subcategory: 'soup' },
    ],
    drinks: [
      { name: 'Jasmine Tea', basePrice: 4, description: 'Fragrant Chinese jasmine green tea', subcategory: 'tea' },
      { name: 'Tsingtao Beer', basePrice: 6, description: 'Classic Chinese lager', subcategory: 'beer' },
      { name: 'Lychee Juice', basePrice: 5, description: 'Fresh lychee fruit juice', subcategory: 'juice' },
    ],
    desserts: [
      { name: 'Sesame Balls', basePrice: 7, description: 'Crispy fried glutinous rice balls with red bean paste', subcategory: 'fried' },
      { name: 'Mango Pudding', basePrice: 8, description: 'Silky mango gelatin with condensed milk', subcategory: 'pudding' },
      { name: 'Egg Tart', basePrice: 6, description: 'Flaky pastry shell with silky egg custard filling', subcategory: 'pastry' },
    ],
  },

  vietnamese: {
    appetizers: [
      { name: 'Summer Rolls', basePrice: 10, description: 'Fresh rice paper rolls with shrimp, vermicelli, herbs, and peanut sauce', subcategory: 'roll' },
      { name: 'Crispy Spring Rolls', basePrice: 10, description: 'Fried rolls with pork, shrimp, and vegetables with nuoc cham', subcategory: 'fried' },
      { name: 'Papaya Salad', basePrice: 11, description: 'Shredded green papaya with shrimp, herbs, and fish sauce dressing', subcategory: 'salad' },
      { name: 'Banh Khot', basePrice: 12, description: 'Mini coconut turmeric pancakes with shrimp and herbs', subcategory: 'pancake' },
      { name: 'Shaking Beef Salad', basePrice: 16, description: 'Cubed filet mignon with watercress, onion, and lime dressing', subcategory: 'salad' },
    ],
    entrees: [
      { name: 'Pho Bo', basePrice: 16, description: 'Classic beef pho with rice noodles, rare steak, and herbs', subcategory: 'soup' },
      { name: 'Bun Bo Hue', basePrice: 17, description: 'Spicy lemongrass beef noodle soup with pork and blood cake', subcategory: 'soup' },
      { name: 'Banh Mi Sandwich', basePrice: 12, description: 'Crispy baguette with pate, cold cuts, pickled vegetables, and cilantro', subcategory: 'sandwich' },
      { name: 'Com Tam', basePrice: 15, description: 'Broken rice with grilled pork chop, egg cake, and pickled vegetables', subcategory: 'rice' },
      { name: 'Lemongrass Chicken', basePrice: 17, description: 'Caramelized lemongrass chicken with steamed rice and vegetables', subcategory: 'chicken' },
      { name: 'Shaking Beef', basePrice: 28, description: 'Wok-seared filet mignon cubes with watercress and lime dipping sauce', subcategory: 'beef' },
      { name: 'Bun Thit Nuong', basePrice: 15, description: 'Vermicelli bowl with grilled pork, spring roll, and fish sauce', subcategory: 'noodle' },
      { name: 'Caramel Claypot Fish', basePrice: 19, description: 'Catfish braised in caramel sauce with ginger and pepper', subcategory: 'seafood' },
      { name: 'Garlic Noodles', basePrice: 14, description: 'Egg noodles tossed with roasted garlic butter and Parmesan', subcategory: 'noodle' },
      { name: 'Bo Luc Lac', basePrice: 24, description: 'Shaking beef on sizzling platter with fried egg and rice', subcategory: 'beef' },
    ],
    sides: [
      { name: 'Steamed Rice', basePrice: 3, description: 'Jasmine rice', subcategory: 'grain' },
      { name: 'Wonton Soup', basePrice: 7, description: 'Shrimp wontons in clear broth with scallions', subcategory: 'soup' },
      { name: 'Pickled Vegetables', basePrice: 4, description: 'House-pickled daikon and carrots', subcategory: 'pickle' },
    ],
    drinks: [
      { name: 'Vietnamese Iced Coffee', basePrice: 6, description: 'Strong drip coffee with sweetened condensed milk over ice', subcategory: 'coffee' },
      { name: 'Fresh Coconut', basePrice: 6, description: 'Young coconut water served in the shell', subcategory: 'non-alcoholic' },
      { name: 'Sugarcane Juice', basePrice: 5, description: 'Fresh-pressed sugarcane with kumquat', subcategory: 'juice' },
    ],
    desserts: [
      { name: 'Che Ba Mau', basePrice: 8, description: 'Three-color dessert with beans, jelly, and coconut milk', subcategory: 'traditional' },
      { name: 'Coconut Flan', basePrice: 8, description: 'Vietnamese-style caramel custard with coconut', subcategory: 'custard' },
      { name: 'Fried Banana', basePrice: 7, description: 'Crispy fried banana with coconut ice cream', subcategory: 'fried' },
    ],
  },

  korean: {
    appetizers: [
      { name: 'Kimchi Pancake', basePrice: 13, description: 'Crispy scallion and kimchi pancake with soy dipping sauce', subcategory: 'pancake' },
      { name: 'Korean Fried Chicken', basePrice: 14, description: 'Double-fried crispy chicken with gochujang or soy garlic glaze', subcategory: 'fried' },
      { name: 'Japchae', basePrice: 13, description: 'Sweet potato glass noodles with vegetables and sesame', subcategory: 'noodle' },
      { name: 'Tteokbokki', basePrice: 12, description: 'Spicy stir-fried rice cakes in gochujang sauce with fish cakes', subcategory: 'rice cake' },
      { name: 'Mandoo', basePrice: 11, description: 'Pan-fried Korean dumplings with pork and vegetables', subcategory: 'dumpling' },
    ],
    entrees: [
      { name: 'Bulgogi', basePrice: 20, description: 'Thinly sliced marinated beef grilled to perfection with rice', subcategory: 'beef' },
      { name: 'Galbi', basePrice: 26, description: 'Marinated short ribs grilled tableside with banchan', subcategory: 'beef' },
      { name: 'Bibimbap', basePrice: 17, description: 'Rice bowl with vegetables, egg, gochujang, and choice of protein', subcategory: 'rice bowl' },
      { name: 'Kimchi Jjigae', basePrice: 16, description: 'Fermented kimchi stew with pork belly, tofu, and vegetables', subcategory: 'stew' },
      { name: 'Spicy Pork BBQ', basePrice: 19, description: 'Gochujang-marinated pork belly grilled with lettuce wraps', subcategory: 'pork' },
      { name: 'Sundubu Jjigae', basePrice: 16, description: 'Soft tofu stew with seafood, egg, and vegetables', subcategory: 'stew' },
      { name: 'Dolsot Bibimbap', basePrice: 19, description: 'Sizzling stone pot rice with vegetables, egg, and crispy bottom', subcategory: 'rice bowl' },
      { name: 'Japchae with Beef', basePrice: 18, description: 'Glass noodles stir-fried with beef and seasonal vegetables', subcategory: 'noodle' },
      { name: 'Army Stew (Budae Jjigae)', basePrice: 22, description: 'Korean fusion stew with kimchi, ramen, sausage, and spam', subcategory: 'stew' },
      { name: 'Seafood Pancake (Haemul Pajeon)', basePrice: 20, description: 'Large crispy pancake loaded with shrimp, squid, and scallions', subcategory: 'pancake' },
    ],
    sides: [
      { name: 'Banchan Set', basePrice: 0, description: 'Assorted Korean side dishes — kimchi, pickled radish, bean sprouts', subcategory: 'banchan' },
      { name: 'Steamed Rice', basePrice: 3, description: 'Short-grain Korean rice', subcategory: 'grain' },
      { name: 'Kimchi', basePrice: 4, description: 'House-fermented napa cabbage kimchi', subcategory: 'pickle' },
    ],
    drinks: [
      { name: 'Soju', basePrice: 8, description: 'Korean rice spirit — original or flavored', subcategory: 'alcohol' },
      { name: 'Korean Barley Tea', basePrice: 3, description: 'Roasted barley tea served hot or cold', subcategory: 'tea' },
      { name: 'Makgeolli', basePrice: 10, description: 'Traditional Korean rice wine — sweet and milky', subcategory: 'alcohol' },
    ],
    desserts: [
      { name: 'Bingsu', basePrice: 14, description: 'Shaved ice with red bean, mochi, condensed milk, and fruit', subcategory: 'frozen' },
      { name: 'Hotteok', basePrice: 8, description: 'Sweet stuffed Korean pancake with brown sugar and nuts', subcategory: 'pancake' },
      { name: 'Yakgwa', basePrice: 7, description: 'Traditional honey cookie with sesame and ginger', subcategory: 'cookie' },
    ],
  },

  pizza: {
    appetizers: [
      { name: 'Garlic Knots', basePrice: 8, description: 'Warm dough knots tossed in garlic butter and herbs', subcategory: 'bread' },
      { name: 'Mozzarella Sticks', basePrice: 10, description: 'Breaded and fried mozzarella with marinara dipping sauce', subcategory: 'fried' },
      { name: 'Bruschetta', basePrice: 11, description: 'Toasted bread with fresh tomatoes, basil, and garlic', subcategory: 'bread' },
      { name: 'Italian Salad', basePrice: 12, description: 'Mixed greens with salami, provolone, pepperoncini, and Italian dressing', subcategory: 'salad' },
      { name: 'Arancini', basePrice: 12, description: 'Fried risotto balls with mozzarella and marinara', subcategory: 'fried' },
    ],
    entrees: [
      { name: 'Margherita Pizza', basePrice: 16, description: 'Fresh mozzarella, San Marzano tomato sauce, and basil', subcategory: 'pizza' },
      { name: 'Pepperoni Pizza', basePrice: 17, description: 'Classic pepperoni with mozzarella and red sauce', subcategory: 'pizza' },
      { name: 'Sausage & Peppers Pizza', basePrice: 18, description: 'Italian sausage, roasted peppers, and mozzarella', subcategory: 'pizza' },
      { name: 'White Truffle Pizza', basePrice: 20, description: 'Truffle cream, wild mushrooms, fontina, and arugula', subcategory: 'pizza' },
      { name: 'Diavola Pizza', basePrice: 18, description: 'Spicy salami, Calabrian chili, mozzarella, and honey drizzle', subcategory: 'pizza' },
      { name: 'Prosciutto & Arugula Pizza', basePrice: 19, description: 'Prosciutto di Parma, arugula, shaved Parmigiano, and lemon oil', subcategory: 'pizza' },
      { name: 'Quattro Formaggi', basePrice: 18, description: 'Four cheese: mozzarella, gorgonzola, fontina, and Parmigiano', subcategory: 'pizza' },
      { name: 'Hawaiian Pizza', basePrice: 17, description: 'Ham, pineapple, mozzarella, and red sauce', subcategory: 'pizza' },
      { name: 'Calzone', basePrice: 16, description: 'Folded pizza dough with ricotta, mozzarella, and pepperoni', subcategory: 'calzone' },
      { name: 'Pesto Chicken Pizza', basePrice: 19, description: 'Basil pesto, grilled chicken, sun-dried tomatoes, and goat cheese', subcategory: 'pizza' },
    ],
    sides: [
      { name: 'Caesar Salad', basePrice: 10, description: 'Romaine, Parmesan, croutons, and classic Caesar dressing', subcategory: 'salad' },
      { name: 'Garlic Breadsticks', basePrice: 7, description: 'Warm breadsticks with garlic butter and marinara', subcategory: 'bread' },
      { name: 'House Salad', basePrice: 8, description: 'Mixed greens with tomato, cucumber, and balsamic vinaigrette', subcategory: 'salad' },
    ],
    drinks: [
      { name: 'Italian Soda', basePrice: 4, description: 'Sparkling water with your choice of fruit syrup', subcategory: 'soda' },
      { name: 'Draft Beer', basePrice: 7, description: 'Rotating selection of local craft beers', subcategory: 'beer' },
      { name: 'House Red Wine', basePrice: 10, description: 'Glass of Italian red — Chianti or Montepulciano', subcategory: 'wine' },
    ],
    desserts: [
      { name: 'Nutella Pizza', basePrice: 12, description: 'Dessert pizza with Nutella, strawberries, and powdered sugar', subcategory: 'pizza' },
      { name: 'Cannoli', basePrice: 9, description: 'Crispy shell with sweet ricotta, chocolate chips, and pistachios', subcategory: 'pastry' },
      { name: 'Gelato', basePrice: 8, description: 'Two scoops of artisan Italian gelato', subcategory: 'frozen' },
    ],
  },

  burger: {
    appetizers: [
      { name: 'Loaded Fries', basePrice: 10, description: 'Crispy fries with cheese sauce, bacon bits, and scallions', subcategory: 'fried' },
      { name: 'Onion Rings', basePrice: 9, description: 'Beer-battered thick-cut onion rings with ranch dipping sauce', subcategory: 'fried' },
      { name: 'Chicken Tenders', basePrice: 12, description: 'Hand-breaded chicken strips with honey mustard and BBQ', subcategory: 'chicken' },
      { name: 'Nachos', basePrice: 13, description: 'Tortilla chips with cheese, jalapenos, sour cream, and guacamole', subcategory: 'fried' },
      { name: 'Chili Cheese Fries', basePrice: 11, description: 'Crispy fries smothered in house chili and melted cheddar', subcategory: 'fried' },
    ],
    entrees: [
      { name: 'Classic Cheeseburger', basePrice: 14, description: 'Angus beef patty, American cheese, lettuce, tomato, onion, pickle', subcategory: 'burger' },
      { name: 'BBQ Bacon Burger', basePrice: 16, description: 'Angus patty with cheddar, smoked bacon, crispy onion rings, BBQ sauce', subcategory: 'burger' },
      { name: 'Mushroom Swiss Burger', basePrice: 16, description: 'Angus patty with sauteed mushrooms and melted Swiss cheese', subcategory: 'burger' },
      { name: 'Spicy Jalapeño Burger', basePrice: 15, description: 'Angus patty with pepper jack, jalapenos, chipotle mayo, and pickled onions', subcategory: 'burger' },
      { name: 'Double Stack Burger', basePrice: 18, description: 'Two Angus patties, double cheese, special sauce, on a toasted brioche', subcategory: 'burger' },
      { name: 'Veggie Burger', basePrice: 14, description: 'House-made plant-based patty with avocado, sprouts, and tahini', subcategory: 'burger' },
      { name: 'Turkey Burger', basePrice: 15, description: 'Ground turkey patty with avocado, Swiss, and garlic aioli', subcategory: 'burger' },
      { name: 'Grilled Chicken Sandwich', basePrice: 15, description: 'Marinated grilled chicken with lettuce, tomato, and herb mayo', subcategory: 'sandwich' },
      { name: 'Truffle Burger', basePrice: 19, description: 'Angus patty with truffle aioli, gruyere, arugula, and caramelized onions', subcategory: 'burger' },
      { name: 'Fish Sandwich', basePrice: 16, description: 'Crispy beer-battered cod with tartar sauce and coleslaw', subcategory: 'sandwich' },
    ],
    sides: [
      { name: 'French Fries', basePrice: 5, description: 'Classic thin-cut crispy fries with house seasoning', subcategory: 'fried' },
      { name: 'Sweet Potato Fries', basePrice: 7, description: 'Crispy sweet potato fries with chipotle mayo', subcategory: 'fried' },
      { name: 'Coleslaw', basePrice: 4, description: 'Creamy house-made coleslaw', subcategory: 'salad' },
    ],
    drinks: [
      { name: 'Milkshake', basePrice: 8, description: 'Hand-spun shake — chocolate, vanilla, or strawberry', subcategory: 'shake' },
      { name: 'Craft Soda', basePrice: 4, description: 'House-made ginger beer or root beer', subcategory: 'soda' },
      { name: 'Draft IPA', basePrice: 8, description: 'Rotating local craft IPA on tap', subcategory: 'beer' },
    ],
    desserts: [
      { name: 'Brownie Sundae', basePrice: 10, description: 'Warm chocolate brownie with vanilla ice cream, hot fudge, and whipped cream', subcategory: 'chocolate' },
      { name: 'Cookies & Cream Shake', basePrice: 9, description: 'Premium shake with crushed Oreos and vanilla ice cream', subcategory: 'shake' },
      { name: 'Churro Bites', basePrice: 8, description: 'Crispy churro pieces with chocolate and caramel dipping sauces', subcategory: 'fried' },
    ],
  },

  // Additional cuisines for broader coverage
  latin_american: {
    appetizers: [
      { name: 'Empanadas', basePrice: 12, description: 'Three baked pastries with beef, chicken, or cheese filling', subcategory: 'pastry' },
      { name: 'Ceviche', basePrice: 15, description: 'Fresh catch cured in citrus with red onion, cilantro, and aji amarillo', subcategory: 'seafood' },
      { name: 'Tostones', basePrice: 10, description: 'Twice-fried green plantains with garlic mojo and chimichurri', subcategory: 'fried' },
      { name: 'Elote', basePrice: 9, description: 'Grilled corn with crema, cotija, chili, and lime', subcategory: 'vegetable' },
      { name: 'Patacones', basePrice: 11, description: 'Crispy plantain rounds with guacamole and hogao', subcategory: 'fried' },
    ],
    entrees: [
      { name: 'Grilled Skirt Steak', basePrice: 28, description: 'Chimichurri-marinated steak with yuca fries and plantains', subcategory: 'beef' },
      { name: 'Arroz con Pollo', basePrice: 18, description: 'Saffron rice with braised chicken, peas, and peppers', subcategory: 'chicken' },
      { name: 'Seafood Paella', basePrice: 26, description: 'Saffron rice with shrimp, mussels, clams, and chorizo', subcategory: 'seafood' },
      { name: 'Pollo a la Brasa', basePrice: 20, description: 'Peruvian rotisserie chicken with green sauce and fries', subcategory: 'chicken' },
      { name: 'Lomo Saltado', basePrice: 22, description: 'Stir-fried beef with tomatoes, onions, fries, and rice', subcategory: 'beef' },
      { name: 'Bandeja Paisa', basePrice: 24, description: 'Colombian platter with beans, rice, plantain, chorizo, and avocado', subcategory: 'traditional' },
      { name: 'Ropa Vieja', basePrice: 19, description: 'Slow-braised shredded beef in tomato-pepper sauce with rice', subcategory: 'beef' },
      { name: 'Grilled Salmon', basePrice: 26, description: 'With passion fruit glaze, coconut rice, and grilled vegetables', subcategory: 'seafood' },
      { name: 'Pork Pernil', basePrice: 20, description: 'Slow-roasted marinated pork shoulder with rice and beans', subcategory: 'pork' },
      { name: 'Cachapa', basePrice: 16, description: 'Sweet corn pancake with queso de mano and pulled pork', subcategory: 'traditional' },
    ],
    sides: [
      { name: 'Plantain Chips', basePrice: 6, description: 'Thin-sliced crispy plantains with garlic mojo', subcategory: 'fried' },
      { name: 'Black Beans & Rice', basePrice: 6, description: 'Cuban-style black beans over white rice', subcategory: 'beans' },
      { name: 'Yuca Fries', basePrice: 8, description: 'Crispy fried cassava with cilantro aioli', subcategory: 'fried' },
    ],
    drinks: [
      { name: 'Passion Fruit Juice', basePrice: 6, description: 'Fresh-pressed maracuya juice', subcategory: 'juice' },
      { name: 'Mojito', basePrice: 13, description: 'White rum, fresh mint, lime, sugar, and soda', subcategory: 'cocktail' },
      { name: 'Chicha Morada', basePrice: 5, description: 'Peruvian purple corn drink with spices and lime', subcategory: 'non-alcoholic' },
    ],
    desserts: [
      { name: 'Tres Leches Cake', basePrice: 11, description: 'Three-milk sponge cake with whipped cream', subcategory: 'cake' },
      { name: 'Alfajores', basePrice: 8, description: 'Dulce de leche sandwich cookies with powdered sugar', subcategory: 'cookie' },
      { name: 'Coconut Flan', basePrice: 9, description: 'Coconut-infused caramel custard', subcategory: 'custard' },
    ],
  },

  burmese: {
    appetizers: [
      { name: 'Tea Leaf Salad', basePrice: 13, description: 'Fermented tea leaves with fried garlic, peanuts, sesame, and lime', subcategory: 'salad' },
      { name: 'Samosa Soup', basePrice: 10, description: 'Crispy samosa pieces in warming chickpea-turmeric broth', subcategory: 'soup' },
      { name: 'Platha with Dip', basePrice: 9, description: 'Flaky Burmese flatbread with potato curry dip', subcategory: 'bread' },
      { name: 'Golden Tofu', basePrice: 10, description: 'Crispy chickpea tofu with spicy tamarind dipping sauce', subcategory: 'fried' },
      { name: 'Rainbow Salad', basePrice: 12, description: 'Shredded vegetables with crushed peanuts, fried garlic, and lime', subcategory: 'salad' },
    ],
    entrees: [
      { name: 'Mango Chicken', basePrice: 17, description: 'Tender chicken in fragrant mango curry sauce with rice', subcategory: 'curry' },
      { name: 'Mohinga', basePrice: 14, description: 'Traditional catfish noodle soup with lemongrass and banana stem', subcategory: 'soup' },
      { name: 'Nan Gyi Thoke', basePrice: 15, description: 'Thick rice noodles with chicken, chickpea flour, and crispy onions', subcategory: 'noodle' },
      { name: 'Coconut Chicken Noodles', basePrice: 16, description: 'Egg noodles in coconut-chicken curry with crispy noodle topping', subcategory: 'noodle' },
      { name: 'Fiery Tofu', basePrice: 15, description: 'Chickpea tofu stir-fried with chili, garlic, and bell peppers', subcategory: 'tofu' },
      { name: 'Lamb Curry', basePrice: 20, description: 'Slow-braised lamb in aromatic Burmese curry with potatoes', subcategory: 'curry' },
      { name: 'Garlic Noodles', basePrice: 14, description: 'Egg noodles with roasted garlic, scallions, and sesame oil', subcategory: 'noodle' },
      { name: 'Shrimp Curry', basePrice: 18, description: 'Tiger shrimp in turmeric-tomato curry with rice', subcategory: 'curry' },
      { name: 'Shan Noodles', basePrice: 14, description: 'Rice noodles with chicken, tomato, and peanuts in Shan-style sauce', subcategory: 'noodle' },
      { name: 'Crispy Catfish Salad', basePrice: 16, description: 'Crispy catfish with shredded cabbage, herbs, and lime dressing', subcategory: 'salad' },
    ],
    sides: [
      { name: 'Coconut Rice', basePrice: 4, description: 'Fragrant rice cooked with coconut milk', subcategory: 'grain' },
      { name: 'Samosas (3)', basePrice: 7, description: 'Crispy pastry with spiced potato filling', subcategory: 'fried' },
      { name: 'Ginger Salad', basePrice: 10, description: 'Shredded ginger with sesame, peanuts, and crispy lentils', subcategory: 'salad' },
    ],
    drinks: [
      { name: 'Burmese Milk Tea', basePrice: 5, description: 'Strong tea with condensed and evaporated milk', subcategory: 'tea' },
      { name: 'Lemongrass Water', basePrice: 4, description: 'Chilled lemongrass-infused water', subcategory: 'non-alcoholic' },
      { name: 'Mango Lassi', basePrice: 6, description: 'Mango yogurt smoothie', subcategory: 'non-alcoholic' },
    ],
    desserts: [
      { name: 'Semolina Cake', basePrice: 7, description: 'Burmese semolina cake with coconut and poppy seeds', subcategory: 'cake' },
      { name: 'Coconut Jelly', basePrice: 6, description: 'Light coconut milk jelly with palm sugar', subcategory: 'jelly' },
      { name: 'Fried Banana', basePrice: 7, description: 'Crispy battered banana with coconut ice cream', subcategory: 'fried' },
    ],
  },
};

// ─── Cuisine Detection ───────────────────────────────────────

const CUISINE_KEYWORDS: Record<string, string[]> = {
  italian: ['italian', 'trattoria', 'ristorante', 'osteria', 'pizzeria'],
  mexican: ['mexican', 'taqueria', 'cantina', 'taco'],
  japanese: ['japanese', 'sushi', 'ramen', 'izakaya', 'teriyaki', 'tempura'],
  american: ['american', 'steakhouse', 'grill', 'bistro', 'tavern', 'brasserie'],
  indian: ['indian', 'tandoori', 'curry', 'masala', 'biryani'],
  thai: ['thai', 'pad thai', 'siam'],
  mediterranean: ['mediterranean', 'greek', 'turkish', 'lebanese', 'middle eastern', 'hummus', 'falafel'],
  chinese: ['chinese', 'dim sum', 'szechuan', 'sichuan', 'cantonese', 'wok'],
  vietnamese: ['vietnamese', 'pho', 'banh mi'],
  korean: ['korean', 'bbq', 'bulgogi', 'kimchi'],
  pizza: ['pizza', 'pizzeria', 'napoletana'],
  burger: ['burger', 'shake shack', 'in-n-out', 'five guys', 'counter'],
  latin_american: ['latin', 'peruvian', 'cuban', 'colombian', 'brazilian'],
  burmese: ['burmese', 'myanmar', 'rangoon'],
};

function detectCuisine(restaurant: RestaurantInput): string {
  // First check explicit cuisine_type from app data
  if (restaurant.cuisine_type) {
    const ct = restaurant.cuisine_type.toLowerCase();
    for (const [cuisine, keywords] of Object.entries(CUISINE_KEYWORDS)) {
      if (keywords.some((k) => ct.includes(k))) return cuisine;
    }
    // Direct match
    if (ct in CUISINE_MENUS) return ct;
  }

  // Check Google Places types
  const types = (restaurant.types ?? []).map((t) => t.toLowerCase());
  for (const [cuisine, keywords] of Object.entries(CUISINE_KEYWORDS)) {
    if (types.some((t) => keywords.some((k) => t.includes(k)))) return cuisine;
  }

  // Check restaurant name
  const name = restaurant.name.toLowerCase();
  for (const [cuisine, keywords] of Object.entries(CUISINE_KEYWORDS)) {
    if (keywords.some((k) => name.includes(k))) return cuisine;
  }

  // Default to american
  return 'american';
}

// ─── Price Adjustment ────────────────────────────────────────

function adjustPrice(basePrice: number, priceLevel: number, seed: number): number {
  // Random factor between 0.85 and 1.25, seeded per restaurant+item
  const pseudoRandom = ((Math.sin(seed * 12.9898 + 78.233) * 43758.5453) % 1 + 1) % 1;
  const variance = 0.85 + pseudoRandom * 0.40; // 0.85 to 1.25

  // Price tier multiplier
  const tierMultiplier: Record<number, number> = {
    1: 0.75,
    2: 1.0,
    3: 1.25,
    4: 1.5,
  };
  const multiplier = tierMultiplier[priceLevel] ?? 1.0;

  const rawPrice = basePrice * variance * multiplier;

  // Round to nearest $0.50
  return Math.round(rawPrice * 2) / 2;
}

// ─── Menu Generation ─────────────────────────────────────────

function generateMenuForRestaurant(
  restaurant: RestaurantInput,
  restaurantId: string,
  globalSeed: number,
): GeneratedMenuItem[] {
  const cuisine = detectCuisine(restaurant);
  const menu = CUISINE_MENUS[cuisine] ?? CUISINE_MENUS['american'];
  const priceLevel = restaurant.price_level ?? restaurant.price_tier ?? 2;

  const items: GeneratedMenuItem[] = [];
  const sources: Array<'website' | 'doordash' | 'ubereats'> = ['website', 'doordash', 'ubereats'];

  // Select items from each category
  const selections: Array<{
    pool: BaseMenuItem[];
    category: MenuCategory;
    count: [number, number]; // [min, max]
  }> = [
    { pool: menu.appetizers, category: 'appetizer', count: [2, 4] },
    { pool: menu.entrees, category: 'entree', count: [4, 7] },
    { pool: menu.sides, category: 'side', count: [2, 3] },
    { pool: menu.drinks, category: 'drink', count: [1, 3] },
    { pool: menu.desserts, category: 'dessert', count: [1, 3] },
  ];

  for (const { pool, category, count } of selections) {
    // Determine how many items (varies by restaurant)
    const seed = globalSeed + restaurantId.length + category.length;
    const pseudoRand = ((Math.sin(seed * 7.31 + 2.17) * 31421.11) % 1 + 1) % 1;
    const numItems = Math.min(
      pool.length,
      count[0] + Math.floor(pseudoRand * (count[1] - count[0] + 1)),
    );

    // Shuffle pool deterministically
    const shuffled = [...pool].sort((a, b) => {
      const sa = Math.sin((a.basePrice * 100 + globalSeed) * 0.1) * 1000;
      const sb = Math.sin((b.basePrice * 100 + globalSeed) * 0.1) * 1000;
      return sa - sb;
    });

    for (let i = 0; i < numItems; i++) {
      const item = shuffled[i];
      const itemSeed = globalSeed + i * 17 + category.charCodeAt(0);
      const price = adjustPrice(item.basePrice, priceLevel, itemSeed);
      const sourceIdx = Math.abs(Math.floor(Math.sin(itemSeed * 3.7) * 100)) % sources.length;

      // Skip items with zero base price (like free banchan)
      if (item.basePrice === 0 && price === 0) continue;

      items.push({
        restaurant_id: restaurantId,
        restaurant_name: restaurant.name,
        name: item.name,
        description: item.description,
        price: Math.max(price, 1), // ensure minimum $1
        category,
        subcategory: item.subcategory,
        source: sources[sourceIdx],
      });
    }
  }

  return items;
}

// ─── Estimate Revenue ────────────────────────────────────────

function estimateRevenue(priceLevel: number, rating: number, reviewCount: number): [number, number] {
  const baseLow: Record<number, number> = { 1: 40000, 2: 60000, 3: 110000, 4: 160000 };
  const baseHigh: Record<number, number> = { 1: 70000, 2: 100000, 3: 180000, 4: 280000 };

  const ratingFactor = (rating / 4.0); // normalize around 4.0
  const popularityFactor = Math.min(reviewCount / 500, 2.0);
  const factor = (ratingFactor + popularityFactor) / 2;

  const low = Math.round((baseLow[priceLevel] ?? 60000) * factor / 5000) * 5000;
  const high = Math.round((baseHigh[priceLevel] ?? 100000) * factor / 5000) * 5000;

  return [low, high];
}

// ─── Load Restaurants ────────────────────────────────────────

function loadRestaurants(): RestaurantInput[] {
  const scriptDir = import.meta.dirname ?? __dirname;

  if (FROM_APP) {
    // Parse the existing app data file directly
    const appDataPath = resolve(scriptDir, '..', 'src', 'data', 'restaurants.ts');
    if (!existsSync(appDataPath)) {
      console.error(`App data not found at: ${appDataPath}`);
      process.exit(1);
    }
    const content = readFileSync(appDataPath, 'utf-8');

    // Extract restaurant objects using regex (works for the hardcoded format)
    const restaurants: RestaurantInput[] = [];
    // Match each object block between { and },
    const objRegex = /\{\s*\n\s*id:\s*'([^']+)'[\s\S]*?metro_area:\s*'([^']+)',?\s*\n\s*\}/g;
    let match;
    while ((match = objRegex.exec(content)) !== null) {
      const block = match[0];
      const get = (key: string): string => {
        // Handle escaped quotes in values like Oren\'s
        const m = block.match(new RegExp(`${key}:\\s*'((?:[^'\\\\]|\\\\.)*?)'`));
        return m ? m[1].replace(/\\'/g, "'") : '';
      };
      const getNum = (key: string): number => {
        const m = block.match(new RegExp(`${key}:\\s*(-?[\\d.]+)`));
        return m ? parseFloat(m[1]) : 0;
      };
      restaurants.push({
        place_id: get('id'),
        name: get('name'),
        address: get('address'),
        latitude: getNum('latitude'),
        longitude: getNum('longitude'),
        rating: getNum('rating'),
        review_count: getNum('review_count'),
        price_tier: getNum('price_tier'),
        cuisine_type: get('cuisine_type'),
        metro_area: get('metro_area'),
        estimated_monthly_revenue_low: getNum('estimated_monthly_revenue_low'),
        estimated_monthly_revenue_high: getNum('estimated_monthly_revenue_high'),
      });
    }

    console.log(`Loaded ${restaurants.length} restaurants from app data`);
    return restaurants;
  }

  // Load from Google Places JSON output
  const jsonPath = resolve(scriptDir, 'output', 'restaurants.json');
  if (!existsSync(jsonPath)) {
    console.error(`No restaurants.json found at: ${jsonPath}`);
    console.error('Run fetch-restaurants.ts first, or use --from-app flag');
    process.exit(1);
  }
  const data = JSON.parse(readFileSync(jsonPath, 'utf-8'));
  console.log(`Loaded ${data.length} restaurants from ${jsonPath}`);
  return data;
}

// ─── Main ────────────────────────────────────────────────────

function main() {
  console.log('\nGenerating realistic menu data...\n');

  const restaurants = loadRestaurants();
  const allItems: GeneratedMenuItem[] = [];

  // Use a global seed based on number of restaurants for reproducibility
  const globalSeed = restaurants.length * 42;

  for (const restaurant of restaurants) {
    const id = restaurant.place_id ?? `rest-${restaurants.indexOf(restaurant) + 1}`;
    const cuisine = detectCuisine(restaurant);
    const priceLevel = restaurant.price_level ?? restaurant.price_tier ?? 2;
    const restaurantSeed = globalSeed + id.split('').reduce((s, c) => s + c.charCodeAt(0), 0);

    const menuItems = generateMenuForRestaurant(restaurant, id, restaurantSeed);
    allItems.push(...menuItems);

    console.log(`  ${restaurant.name} (${cuisine}, ${'$'.repeat(priceLevel)}): ${menuItems.length} items`);
  }

  // Write output
  const scriptDir = import.meta.dirname ?? __dirname;
  const outDir = resolve(scriptDir, 'output');
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, 'menu_items.json');
  writeFileSync(outPath, JSON.stringify(allItems, null, 2));

  // Also write restaurants.json so downstream scripts (seed-supabase, import-to-app) can read it
  const restOutPath = resolve(outDir, 'restaurants.json');
  writeFileSync(restOutPath, JSON.stringify(restaurants, null, 2));
  console.log(`Restaurants written to: ${restOutPath}`);

  console.log(`\nGenerated ${allItems.length} menu items across ${restaurants.length} restaurants`);
  console.log(`Written to: ${outPath}\n`);

  // Summary stats
  const byCuisine: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  for (const item of allItems) {
    byCategory[item.category] = (byCategory[item.category] ?? 0) + 1;
  }
  for (const restaurant of restaurants) {
    const c = detectCuisine(restaurant);
    byCuisine[c] = (byCuisine[c] ?? 0) + 1;
  }

  console.log('Items by category:');
  for (const [cat, count] of Object.entries(byCategory).sort()) {
    console.log(`  ${cat}: ${count}`);
  }

  console.log('\nRestaurants by cuisine:');
  for (const [cuisine, count] of Object.entries(byCuisine).sort()) {
    console.log(`  ${cuisine}: ${count}`);
  }

  // Price range stats
  const entrees = allItems.filter((i) => i.category === 'entree');
  if (entrees.length > 0) {
    const prices = entrees.map((e) => e.price).sort((a, b) => a - b);
    const avg = prices.reduce((s, p) => s + p, 0) / prices.length;
    console.log(`\nEntree price range: $${prices[0].toFixed(2)} - $${prices[prices.length - 1].toFixed(2)}`);
    console.log(`Average entree price: $${avg.toFixed(2)}`);
  }
}

main();
