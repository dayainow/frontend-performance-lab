import {
  createContext,
  memo,
  ReactNode,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { Metric } from "../../components/Metric";
import { SegmentedControl } from "../../components/SegmentedControl";

type StateMode = "single" | "split";

type UserState = { name: string; tier: string };
type FilterState = { status: string; sort: string };
type CartState = { items: number };

const userState: UserState = { name: "Daya", tier: "Pro" };
const filterState: FilterState = { status: "Active", sort: "Revenue" };

const SingleContext = createContext<{
  user: UserState;
  filter: FilterState;
  cart: CartState;
} | null>(null);

const UserContext = createContext<UserState | null>(null);
const FilterContext = createContext<FilterState | null>(null);
const CartContext = createContext<CartState | null>(null);

export function StatePropagationLab() {
  const [mode, setMode] = useState<StateMode>("single");
  const [cartItems, setCartItems] = useState(1);
  const cart = useMemo(() => ({ items: cartItems }), [cartItems]);
  const singleValue = useMemo(
    () => ({ user: userState, filter: filterState, cart }),
    [cart],
  );

  const content =
    mode === "single" ? (
      <SingleContext.Provider value={singleValue}>
        <StateConsumers variant="single" />
      </SingleContext.Provider>
    ) : (
      <UserContext.Provider value={userState}>
        <FilterContext.Provider value={filterState}>
          <CartContext.Provider value={cart}>
            <StateConsumers variant="split" />
          </CartContext.Provider>
        </FilterContext.Provider>
      </UserContext.Provider>
    );

  return (
    <div className="lab-grid">
      <aside className="lab-panel">
        <SegmentedControl
          label="Context 설계"
          value={mode}
          options={[
            { label: "Single", value: "single" },
            { label: "Split", value: "split" },
          ]}
          onChange={setMode}
        />

        <button
          type="button"
          className="primary-action"
          onClick={() => setCartItems((items) => items + 1)}
        >
          장바구니 수량 변경
        </button>

        <div className="metrics-grid">
          <Metric label="Cart items" value={cartItems} />
          <Metric label="User state" value="stable" tone="good" />
          <Metric label="Filter state" value="stable" tone="good" />
        </div>

        <div className="note">
          <strong>관찰 포인트</strong>
          <p>
            Single Context는 cart만 바뀌어도 같은 객체를 구독하는 소비자가 모두
            반응합니다. Split Context는 변경되는 값의 구독 범위를 좁힙니다.
          </p>
        </div>
      </aside>

      <section className="consumer-stage">{content}</section>
    </div>
  );
}

function StateConsumers({ variant }: { variant: StateMode }) {
  const Wrapper = variant === "single" ? SingleConsumers : SplitConsumers;

  return (
    <div className="consumer-grid">
      <Wrapper>
        <UserBadge variant={variant} />
        <FilterSummary variant={variant} />
        <CartSummary variant={variant} />
      </Wrapper>
    </div>
  );
}

function SingleConsumers({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function SplitConsumers({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

const UserBadge = memo(function UserBadge({ variant }: { variant: StateMode }) {
  const renderCount = useRenderCounter();
  const user =
    variant === "single" ? useRequiredContext(SingleContext).user : useRequiredContext(UserContext);

  return (
    <div className="consumer-card">
      <span>User</span>
      <strong>{user.name}</strong>
      <p>{user.tier} plan</p>
      <small>render {renderCount}</small>
    </div>
  );
});

const FilterSummary = memo(function FilterSummary({ variant }: { variant: StateMode }) {
  const renderCount = useRenderCounter();
  const filter =
    variant === "single"
      ? useRequiredContext(SingleContext).filter
      : useRequiredContext(FilterContext);

  return (
    <div className="consumer-card">
      <span>Filter</span>
      <strong>{filter.status}</strong>
      <p>Sorted by {filter.sort}</p>
      <small>render {renderCount}</small>
    </div>
  );
});

const CartSummary = memo(function CartSummary({ variant }: { variant: StateMode }) {
  const renderCount = useRenderCounter();
  const cart =
    variant === "single" ? useRequiredContext(SingleContext).cart : useRequiredContext(CartContext);

  return (
    <div className="consumer-card">
      <span>Cart</span>
      <strong>{cart.items}</strong>
      <p>Selected products</p>
      <small>render {renderCount}</small>
    </div>
  );
});

function useRenderCounter() {
  const counter = useRef(0);
  counter.current += 1;
  return counter.current;
}

function useRequiredContext<T>(context: React.Context<T | null>) {
  const value = useContext(context);
  if (!value) {
    throw new Error("Missing context provider");
  }
  return value;
}
