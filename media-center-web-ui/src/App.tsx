import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import NavBar from "./components/nav-bar/NavBar";
import SearchView from "./views/search-view/search-view";

const queryClient = new QueryClient();

const App = () =>
    <QueryClientProvider client={queryClient}>
        <NavBar appName="Downloader" links={[{ title: 'Home', path: '/' }]} />
        <div class="container m-auto">
            <SearchView />
        </div>
    </QueryClientProvider>

export default App;