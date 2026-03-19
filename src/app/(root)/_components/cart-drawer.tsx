import { Button, Drawer } from "@heroui/react";
import { ShoppingBag } from "@gravity-ui/icons";

const CartDrawer = () => {
  return (
    <Drawer>
      <Button variant="outline">
        <ShoppingBag />
      </Button>
      <Drawer.Backdrop>
        <Drawer.Content placement="right">
          <Drawer.Dialog>
            <Drawer.CloseTrigger />
            <Drawer.Header>
              <Drawer.Heading>Cart</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body>
              {Array.from({ length: 20 }).map((_, i) => (
                <p key={i} className="mb-3">
                  Paragraph {i + 1}: Lorem ipsum dolor sit amet, consectetur
                  adipiscing elit. Nullam pulvinar risus non risus hendrerit
                  venenatis. Pellentesque sit amet hendrerit risus, sed
                  porttitor quam.
                </p>
              ))}
            </Drawer.Body>
            <Drawer.Footer>
              <Button fullWidth variant="secondary">
                Checkout
              </Button>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
};

export default CartDrawer;
