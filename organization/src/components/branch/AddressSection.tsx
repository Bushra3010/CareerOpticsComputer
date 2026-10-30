import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { INDIAN_STATES, DISTRICTS_BY_STATE, canonicalState } from "@/data/indianStates";
import { blocksFor, citiesFor } from "@/data/indianCities";
import { SelectWithCustom } from "@/components/ui/select-with-custom";
import { lookupPincode, geocode, uniqueSorted, type PostalPlace } from "@/lib/postal";

export function AddressSection() {
  // Select values are the plain names, so they round-trip into the lookup
  // tables unchanged. Slugging broke on names containing "and"
  // ("Jammu and Kashmir" -> "Jammu And Kashmir", which matches no key).
  const [stateKey, setStateKey] = useState("");
  const [districtKey, setDistrictKey] = useState("");

  // A district the PIN lookup reported that the bundled table does not carry
  // (renamed or newly carved-out districts). India Post is authoritative for
  // the address being entered, so it joins the options rather than being lost.
  const [extraDistrict, setExtraDistrict] = useState("");

  const availableDistricts = useMemo(() => {
    const base = stateKey ? DISTRICTS_BY_STATE[stateKey] || [] : [];
    if (!extraDistrict || base.some((d) => d.toLowerCase() === extraDistrict.toLowerCase())) {
      return base;
    }
    return [...base, extraDistrict].sort((a, b) => a.localeCompare(b));
  }, [stateKey, extraDistrict]);

  const [blockQuery, setBlockQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [pincode, setPincode] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [postal, setPostal] = useState<PostalPlace[]>([]);
  const [pinStatus, setPinStatus] = useState<"idle" | "loading" | "found" | "missing">("idle");

  // A PIN code resolves the whole tail of the address, so prefer its data and
  // fall back to the bundled table when the lookup found nothing.
  const places = useMemo(() => {
    if (postal.length > 0) {
      return {
        blocks: uniqueSorted(postal.map((p) => p.block)),
        cities: uniqueSorted(postal.map((p) => p.name)),
      };
    }
    return { blocks: blocksFor(districtKey, stateKey), cities: citiesFor(districtKey) };
  }, [postal, districtKey, stateKey]);

  // Debounced: fill state / district / block / city / coordinates from the PIN.
  useEffect(() => {
    if (!/^\d{6}$/.test(pincode)) {
      setPostal([]);
      setPinStatus("idle");
      return;
    }
    let cancelled = false;
    setPinStatus("loading");
    const timer = setTimeout(async () => {
      const rows = await lookupPincode(pincode);
      if (cancelled) return;
      setPostal(rows);
      setPinStatus(rows.length > 0 ? "found" : "missing");
      if (rows.length === 0) return;

      const [first] = rows;
      const state = canonicalState(first.state);
      if (INDIAN_STATES.includes(state)) setStateKey(state);
      const reported = first.district.trim();
      const district = (DISTRICTS_BY_STATE[state] || []).find(
        (d) => d.toLowerCase() === reported.toLowerCase()
      );
      if (district) {
        setDistrictKey(district);
      } else if (reported) {
        setExtraDistrict(reported);
        setDistrictKey(reported);
      }

      const blocks = uniqueSorted(rows.map((r) => r.block));
      if (blocks.length === 1) setBlockQuery(blocks[0]);
      if (rows.length === 1) setCityQuery(rows[0].name);

      const point = await geocode(
        `${first.pincode}, ${first.district}, ${first.state}, India`
      );
      if (!cancelled && point) {
        setLatitude(point.lat);
        setLongitude(point.lon);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [pincode]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Address Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="address">Street Address *</Label>
          <Textarea id="address" name="address" placeholder="Enter full address" rows={2} />
        </div>
        {/* The written address and the pin on a map are not the same thing: a
            lane with no name is found by the link and by nothing else. Paste
            what "Share" gives you in Google Maps. */}
        <div className="space-y-2">
          <Label htmlFor="mapLink">Map link</Label>
          <Input
            id="mapLink"
            name="mapLink"
            type="url"
            inputMode="url"
            placeholder="https://maps.app.goo.gl/… or https://maps.google.com/…"
          />
          <p className="text-xs text-muted-foreground">
            Optional. Open the branch in Google Maps, tap Share, and paste the link here.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <Select
              name="state"
              value={stateKey}
              onValueChange={(val) => {
                setStateKey(val);
                setDistrictKey("");
                setExtraDistrict("");
                setBlockQuery("");
                setCityQuery("");
              }}
            >
              <SelectTrigger id="state">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {INDIAN_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="district">District *</Label>
            <Select
              name="district"
              value={districtKey}
              disabled={!stateKey || availableDistricts.length === 0}
              onValueChange={(val) => {
                setDistrictKey(val);
                setBlockQuery("");
                setCityQuery("");
              }}
            >
              <SelectTrigger id="district">
                <SelectValue
                  placeholder={stateKey ? "Select district" : "Select state first"}
                />
              </SelectTrigger>
              <SelectContent>
                {availableDistricts.map((district) => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* Block and city: dropdowns once a district is picked, with "Other"
            for a place the lists do not carry. */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="block">Block</Label>
            <SelectWithCustom
              id="block"
              name="block"
              value={blockQuery}
              onValueChange={setBlockQuery}
              options={places.blocks}
              placeholder={districtKey ? "Select block" : "Select district first"}
              customPlaceholder="Type the block"
              disabled={!districtKey}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <SelectWithCustom
              id="city"
              name="city"
              value={cityQuery}
              onValueChange={setCityQuery}
              options={places.cities}
              placeholder={districtKey ? "Select city" : "Select district first"}
              customPlaceholder="Type the city"
              disabled={!districtKey}
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode *</Label>
            <Input
              id="pincode"
              name="pincode"
              placeholder="6-digit PIN"
              inputMode="numeric"
              maxLength={6}
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              {pinStatus === "loading" && "Looking up PIN code..."}
              {pinStatus === "found" &&
                "State, district, block, city and coordinates filled from this PIN."}
              {pinStatus === "missing" && "PIN code not found — fill the rest manually."}
              {pinStatus === "idle" && "Enter a PIN to auto-fill the fields above."}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              name="latitude"
              type="number"
              step="any"
              placeholder="e.g., 28.6139"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              name="longitude"
              type="number"
              step="any"
              placeholder="e.g., 77.2090"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Select name="country" defaultValue="india">
            <SelectTrigger id="country">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="india">India</SelectItem>
              <SelectItem value="usa">United States</SelectItem>
              <SelectItem value="uk">United Kingdom</SelectItem>
              <SelectItem value="canada">Canada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
