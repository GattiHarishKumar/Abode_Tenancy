package com.abode.tenancy.service;

import com.abode.tenancy.domain.enums.BedStatus;
import com.abode.tenancy.domain.model.*;
import com.abode.tenancy.domain.repository.BedRepository;
import com.abode.tenancy.domain.repository.PropertyRepository;
import com.abode.tenancy.domain.repository.RoomRepository;
import com.abode.tenancy.domain.repository.UserRepository;
import com.abode.tenancy.dto.PropertyDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final BedRepository bedRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<PropertyDto.Summary> getOwnerProperties(UUID ownerId) {
        List<Property> properties = propertyRepository.findByOwnerId(ownerId);
        return properties.stream().map(this::buildPropertySummary).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PropertyDto.Summary getPropertySummary(UUID propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("Property not found with ID: " + propertyId));
        return buildPropertySummary(property);
    }

    @Transactional
    public Property createProperty(UUID ownerId, PropertyDto.CreateRequest request) {
        if (propertyRepository.existsBySlug(request.getSlug())) {
            throw new IllegalArgumentException("Property with slug '" + request.getSlug() + "' already exists");
        }

        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new IllegalArgumentException("Owner not found"));

        Property property = Property.builder()
                .owner(owner)
                .name(request.getName())
                .slug(request.getSlug())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .genderAllowed(request.getGenderAllowed())
                .contactPhone(request.getContactPhone())
                .contactEmail(request.getContactEmail())
                .description(request.getDescription())
                .rules(request.getRules())
                .noticePeriodDays(request.getNoticePeriodDays())
                .defaultDeposit(request.getDefaultDeposit())
                .build();

        property = propertyRepository.save(property);
        auditService.log(property.getId(), ownerId, "CREATE", "Property", property.getId().toString(), "Created property " + property.getName());
        return property;
    }

    @Transactional(readOnly = true)
    public PropertyDto.PublicProfile getPublicProfile(String slug) {
        Property property = propertyRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("PG profile not found for slug: " + slug));

        List<PropertyDto.PhotoItem> photos = property.getPhotos().stream()
                .map(p -> PropertyDto.PhotoItem.builder()
                        .id(p.getId())
                        .category(p.getCategory())
                        .photoUrl(p.getPhotoUrl())
                        .caption(p.getCaption())
                        .sortOrder(p.getSortOrder())
                        .build())
                .collect(Collectors.toList());

        List<PropertyDto.FacilityItem> facilities = property.getFacilities().stream()
                .map(f -> PropertyDto.FacilityItem.builder()
                        .id(f.getId())
                        .facilityName(f.getFacilityName())
                        .icon(f.getIcon())
                        .isAvailable(f.getIsAvailable())
                        .build())
                .collect(Collectors.toList());

        List<PropertyDto.PricingItem> pricing = property.getPricing().stream()
                .map(pr -> PropertyDto.PricingItem.builder()
                        .id(pr.getId())
                        .sharingType(pr.getSharingType())
                        .monthlyRent(pr.getMonthlyRent())
                        .depositAmount(pr.getDepositAmount())
                        .description(pr.getDescription())
                        .build())
                .collect(Collectors.toList());

        List<PropertyDto.FaqItem> faqs = property.getFaqs().stream()
                .map(faq -> PropertyDto.FaqItem.builder()
                        .id(faq.getId())
                        .question(faq.getQuestion())
                        .answer(faq.getAnswer())
                        .sortOrder(faq.getSortOrder())
                        .build())
                .collect(Collectors.toList());

        // Calculate live vacancies per sharing type
        List<Room> rooms = roomRepository.findByPropertyIdOrderByRoomNumberAsc(property.getId());
        Map<Integer, List<Room>> bySharing = rooms.stream().collect(Collectors.groupingBy(Room::getSharingType));

        List<PropertyDto.VacancyItem> vacancies = new ArrayList<>();
        for (Map.Entry<Integer, List<Room>> entry : bySharing.entrySet()) {
            int sharing = entry.getKey();
            long totalBeds = 0;
            long availableBeds = 0;

            for (Room r : entry.getValue()) {
                totalBeds += r.getBeds().size();
                availableBeds += r.getBeds().stream().filter(b -> b.getStatus() == BedStatus.AVAILABLE).count();
            }

            vacancies.add(PropertyDto.VacancyItem.builder()
                    .sharingType(sharing)
                    .totalBeds(totalBeds)
                    .availableBeds(availableBeds)
                    .status(availableBeds > 0 ? "AVAILABLE" : "FULL")
                    .build());
        }

        return PropertyDto.PublicProfile.builder()
                .id(property.getId())
                .name(property.getName())
                .slug(property.getSlug())
                .address(property.getAddress())
                .city(property.getCity())
                .state(property.getState())
                .pincode(property.getPincode())
                .genderAllowed(property.getGenderAllowed())
                .contactPhone(property.getContactPhone())
                .contactEmail(property.getContactEmail())
                .description(property.getDescription())
                .rules(property.getRules())
                .noticePeriodDays(property.getNoticePeriodDays())
                .defaultDeposit(property.getDefaultDeposit())
                .referralReward(property.getReferralReward())
                .photos(photos)
                .facilities(facilities)
                .pricing(pricing)
                .faqs(faqs)
                .vacancies(vacancies)
                .build();
    }

    private PropertyDto.Summary buildPropertySummary(Property property) {
        long totalRooms = roomRepository.countByPropertyId(property.getId());
        long totalBeds = bedRepository.countByRoomPropertyId(property.getId());
        long occupiedBeds = bedRepository.countByRoomPropertyIdAndStatus(property.getId(), BedStatus.OCCUPIED);
        long availableBeds = bedRepository.countByRoomPropertyIdAndStatus(property.getId(), BedStatus.AVAILABLE);

        double occupancyRate = totalBeds > 0 ? ((double) occupiedBeds / totalBeds) * 100.0 : 0.0;

        return PropertyDto.Summary.builder()
                .id(property.getId())
                .name(property.getName())
                .slug(property.getSlug())
                .address(property.getAddress())
                .city(property.getCity())
                .state(property.getState())
                .pincode(property.getPincode())
                .genderAllowed(property.getGenderAllowed())
                .contactPhone(property.getContactPhone())
                .contactEmail(property.getContactEmail())
                .totalRooms((int) totalRooms)
                .totalBeds(totalBeds)
                .occupiedBeds(occupiedBeds)
                .availableBeds(availableBeds)
                .occupancyRate(Math.round(occupancyRate * 10.0) / 10.0)
                .build();
    }
}

