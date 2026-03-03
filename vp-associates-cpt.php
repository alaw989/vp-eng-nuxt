<?php
/**
 * Plugin Name: VP Associates Custom Post Types
 * Plugin URI: https://vp-associates.com
 * Description: Registers Custom Post Types for Services, Projects, Team, Testimonials, Positions, Certificates, and Locations with REST API support. Uses native WordPress custom fields (no ACF required).
 * Version: 1.5.0
 * Author: VP Associates
 * Text Domain: vp-associates
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register Custom Post Types
 */
class VP_Associates_CPT {

    public function __construct() {
        add_action('init', array($this, 'register_cpts'));
        add_action('init', array($this, 'register_taxonomies'));
        add_action('rest_api_init', array($this, 'register_custom_fields_to_api'));
        add_action('add_meta_boxes', array($this, 'add_meta_boxes'));
        add_action('save_post', array($this, 'save_custom_fields'), 10, 2);
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
    }

    /**
     * Enqueue admin scripts for media uploader
     */
    public function enqueue_admin_scripts($hook) {
        // Only load on post edit screens
        if ($hook !== 'post.php' && $hook !== 'post-new.php') {
            return;
        }

        wp_enqueue_media();
        wp_enqueue_script('vp-admin-scripts', plugin_dir_url(__FILE__) . 'admin.js', array('jquery'), '1.0.0', true);
        wp_enqueue_style('vp-admin-styles', plugin_dir_url(__FILE__) . 'admin.css', array(), '1.0.0');
    }

    /**
     * Register all Custom Post Types
     */
    public function register_cpts() {
        $this->register_services_cpt();
        $this->register_projects_cpt();
        $this->register_team_cpt();
        $this->register_testimonials_cpt();
        $this->register_positions_cpt();
        $this->register_certificates_cpt();
        $this->register_locations_cpt();
    }

    /**
     * Register Services CPT
     */
    private function register_services_cpt() {
        $labels = array(
            'name'                  => 'Services',
            'singular_name'         => 'Service',
            'menu_name'             => 'Services',
            'add_new'               => 'Add New',
            'add_new_item'          => 'Add New Service',
            'edit_item'             => 'Edit Service',
            'new_item'              => 'New Service',
            'view_item'             => 'View Service',
            'view_items'            => 'View Services',
            'search_items'          => 'Search Services',
            'not_found'             => 'No services found',
            'not_found_in_trash'    => 'No services found in trash',
            'all_items'             => 'All Services',
            'archives'              => 'Service Archives',
            'insert_into_item'      => 'Insert into service',
            'uploaded_to_this_item' => 'Uploaded to this service',
        );

        $args = array(
            'labels'                => $labels,
            'description'           => 'Services offered by VP Associates',
            'public'                => true,
            'publicly_queryable'    => true,
            'show_ui'               => true,
            'show_in_menu'          => true,
            'show_in_nav_menus'     => true,
            'show_in_rest'          => true,
            'rest_base'             => 'services',
            'rest_controller_class' => 'WP_REST_Posts_Controller',
            'has_archive'           => true,
            'rewrite'               => array('slug' => 'services'),
            'capability_type'       => 'post',
            'supports'              => array('title', 'editor', 'excerpt', 'thumbnail', 'custom-fields'),
            'menu_position'         => 20,
            'menu_icon'             => 'dashicons-admin-generic',
            'hierarchical'          => false,
            'query_var'             => true,
            'can_export'            => true,
        );

        register_post_type('service', $args);
    }

    /**
     * Register Projects CPT
     */
    private function register_projects_cpt() {
        $labels = array(
            'name'                  => 'Projects',
            'singular_name'         => 'Project',
            'menu_name'             => 'Projects',
            'add_new'               => 'Add New',
            'add_new_item'          => 'Add New Project',
            'edit_item'             => 'Edit Project',
            'new_item'              => 'New Project',
            'view_item'             => 'View Project',
            'view_items'            => 'View Projects',
            'search_items'          => 'Search Projects',
            'not_found'             => 'No projects found',
            'not_found_in_trash'    => 'No projects found in trash',
            'all_items'             => 'All Projects',
            'archives'              => 'Project Archives',
            'insert_into_item'      => 'Insert into project',
            'uploaded_to_this_item' => 'Uploaded to this project',
        );

        $args = array(
            'labels'                => $labels,
            'description'           => 'Portfolio projects showcase',
            'public'                => true,
            'publicly_queryable'    => true,
            'show_ui'               => true,
            'show_in_menu'          => true,
            'show_in_nav_menus'     => true,
            'show_in_rest'          => true,
            'rest_base'             => 'projects',
            'rest_controller_class' => 'WP_REST_Posts_Controller',
            'has_archive'           => true,
            'rewrite'               => array('slug' => 'projects'),
            'capability_type'       => 'post',
            'supports'              => array('title', 'editor', 'excerpt', 'thumbnail', 'custom-fields'),
            'menu_position'         => 21,
            'menu_icon'             => 'dashicons-building',
            'hierarchical'          => false,
            'query_var'             => true,
            'can_export'            => true,
        );

        register_post_type('project', $args);
    }

    /**
     * Register Team CPT
     */
    private function register_team_cpt() {
        $labels = array(
            'name'                  => 'Team Members',
            'singular_name'         => 'Team Member',
            'menu_name'             => 'Team',
            'add_new'               => 'Add New',
            'add_new_item'          => 'Add New Team Member',
            'edit_item'             => 'Edit Team Member',
            'new_item'              => 'New Team Member',
            'view_item'             => 'View Team Member',
            'view_items'            => 'View Team',
            'search_items'          => 'Search Team',
            'not_found'             => 'No team members found',
            'not_found_in_trash'    => 'No team members found in trash',
            'all_items'             => 'All Team Members',
            'archives'              => 'Team Archives',
            'insert_into_item'      => 'Insert into team member',
            'uploaded_to_this_item' => 'Uploaded to this team member',
        );

        $args = array(
            'labels'                => $labels,
            'description'           => 'Team member profiles',
            'public'                => true,
            'publicly_queryable'    => true,
            'show_ui'               => true,
            'show_in_menu'          => true,
            'show_in_nav_menus'     => true,
            'show_in_rest'          => true,
            'rest_base'             => 'team',
            'rest_controller_class' => 'WP_REST_Posts_Controller',
            'has_archive'           => false,
            'rewrite'               => array('slug' => 'team'),
            'capability_type'       => 'post',
            'supports'              => array('title', 'editor', 'excerpt', 'thumbnail', 'custom-fields'),
            'menu_position'         => 22,
            'menu_icon'             => 'dashicons-groups',
            'hierarchical'          => false,
            'query_var'             => true,
            'can_export'            => true,
        );

        register_post_type('team', $args);
    }

    /**
     * Register Testimonials CPT
     */
    private function register_testimonials_cpt() {
        $labels = array(
            'name'                  => 'Testimonials',
            'singular_name'         => 'Testimonial',
            'menu_name'             => 'Testimonials',
            'add_new'               => 'Add New',
            'add_new_item'          => 'Add New Testimonial',
            'edit_item'             => 'Edit Testimonial',
            'new_item'              => 'New Testimonial',
            'view_item'             => 'View Testimonial',
            'view_items'            => 'View Testimonials',
            'search_items'          => 'Search Testimonials',
            'not_found'             => 'No testimonials found',
            'not_found_in_trash'    => 'No testimonials found in trash',
            'all_items'             => 'All Testimonials',
            'archives'              => 'Testimonial Archives',
            'insert_into_item'      => 'Insert into testimonial',
            'uploaded_to_this_item' => 'Uploaded to this testimonial',
        );

        $args = array(
            'labels'                => $labels,
            'description'           => 'Client testimonials',
            'public'                => true,
            'publicly_queryable'    => true,
            'show_ui'               => true,
            'show_in_menu'          => true,
            'show_in_nav_menus'     => true,
            'show_in_rest'          => true,
            'rest_base'             => 'testimonials',
            'rest_controller_class' => 'WP_REST_Posts_Controller',
            'has_archive'           => false,
            'rewrite'               => array('slug' => 'testimonials'),
            'capability_type'       => 'post',
            'supports'              => array('title', 'editor', 'excerpt', 'thumbnail', 'custom-fields'),
            'menu_position'         => 23,
            'menu_icon'             => 'dashicons-format-quote',
            'hierarchical'          => false,
            'query_var'             => true,
            'can_export'            => true,
        );

        register_post_type('testimonial', $args);
    }

    /**
     * Register Positions CPT
     */
    private function register_positions_cpt() {
        $labels = array(
            'name'                  => 'Positions',
            'singular_name'         => 'Position',
            'menu_name'             => 'Positions',
            'add_new'               => 'Add New',
            'add_new_item'          => 'Add New Position',
            'edit_item'             => 'Edit Position',
            'new_item'              => 'New Position',
            'view_item'             => 'View Position',
            'view_items'            => 'View Positions',
            'search_items'          => 'Search Positions',
            'not_found'             => 'No positions found',
            'not_found_in_trash'    => 'No positions found in trash',
            'all_items'             => 'All Positions',
            'archives'              => 'Position Archives',
            'insert_into_item'      => 'Insert into position',
            'uploaded_to_this_item' => 'Uploaded to this position',
        );

        $args = array(
            'labels'                => $labels,
            'description'           => 'Open job positions and career opportunities',
            'public'                => true,
            'publicly_queryable'    => true,
            'show_ui'               => true,
            'show_in_menu'          => true,
            'show_in_nav_menus'     => true,
            'show_in_rest'          => true,
            'rest_base'             => 'positions',
            'rest_controller_class' => 'WP_REST_Posts_Controller',
            'has_archive'           => false,
            'rewrite'               => array('slug' => 'careers'),
            'capability_type'       => 'post',
            'supports'              => array('title', 'editor', 'excerpt', 'custom-fields'),
            'menu_position'         => 24,
            'menu_icon'             => 'dashicons-id',
            'hierarchical'          => false,
            'query_var'             => true,
            'can_export'            => true,
        );

        register_post_type('position', $args);
    }

    /**
     * Register Certificates CPT
     */
    private function register_certificates_cpt() {
        $labels = array(
            'name'                  => 'Certificates',
            'singular_name'         => 'Certificate',
            'menu_name'             => 'Certificates',
            'add_new'               => 'Add New',
            'add_new_item'          => 'Add New Certificate',
            'edit_item'             => 'Edit Certificate',
            'new_item'              => 'New Certificate',
            'view_item'             => 'View Certificate',
            'view_items'            => 'View Certificates',
            'search_items'          => 'Search Certificates',
            'not_found'             => 'No certificates found',
            'not_found_in_trash'    => 'No certificates found in trash',
            'all_items'             => 'All Certificates',
            'archives'              => 'Certificate Archives',
            'insert_into_item'      => 'Insert into certificate',
            'uploaded_to_this_item' => 'Uploaded to this certificate',
        );

        $args = array(
            'labels'                => $labels,
            'description'           => 'Professional certifications and affiliations',
            'public'                => true,
            'publicly_queryable'    => true,
            'show_ui'               => true,
            'show_in_menu'          => true,
            'show_in_nav_menus'     => true,
            'show_in_rest'          => true,
            'rest_base'             => 'certificates',
            'rest_controller_class' => 'WP_REST_Posts_Controller',
            'has_archive'           => false,
            'rewrite'               => array('slug' => 'certificates'),
            'capability_type'       => 'post',
            'supports'              => array('title', 'excerpt', 'thumbnail', 'custom-fields'),
            'menu_position'         => 26,
            'menu_icon'             => 'dashicons-awards',
            'hierarchical'          => false,
            'query_var'             => true,
            'can_export'            => true,
        );

        register_post_type('certificate', $args);
    }

    /**
     * Register Locations CPT
     */
    private function register_locations_cpt() {
        $labels = array(
            'name'                  => 'Locations',
            'singular_name'         => 'Location',
            'menu_name'             => 'Locations',
            'add_new'               => 'Add New',
            'add_new_item'          => 'Add New Location',
            'edit_item'             => 'Edit Location',
            'new_item'              => 'New Location',
            'view_item'             => 'View Location',
            'view_items'            => 'View Locations',
            'search_items'          => 'Search Locations',
            'not_found'             => 'No locations found',
            'not_found_in_trash'    => 'No locations found in trash',
            'all_items'             => 'All Locations',
            'archives'              => 'Location Archives',
            'insert_into_item'      => 'Insert into location',
            'uploaded_to_this_item' => 'Uploaded to this location',
        );

        $args = array(
            'labels'                => $labels,
            'description'           => 'Service areas and locations served',
            'public'                => true,
            'publicly_queryable'    => true,
            'show_ui'               => true,
            'show_in_menu'          => true,
            'show_in_nav_menus'     => true,
            'show_in_rest'          => true,
            'rest_base'             => 'locations',
            'rest_controller_class' => 'WP_REST_Posts_Controller',
            'has_archive'           => false,
            'rewrite'               => array('slug' => 'locations'),
            'capability_type'       => 'post',
            'supports'              => array('title', 'custom-fields'),
            'menu_position'         => 27,
            'menu_icon'             => 'dashicons-location',
            'hierarchical'          => false,
            'query_var'             => true,
            'can_export'            => true,
        );

        register_post_type('location', $args);
    }

    /**
     * Register Taxonomies
     */
    public function register_taxonomies() {
        // Service Categories
        register_taxonomy('service_category', 'service', array(
            'labels'            => array(
                'name'              => 'Service Categories',
                'singular_name'     => 'Service Category',
                'search_items'      => 'Search Service Categories',
                'all_items'         => 'All Service Categories',
                'parent_item'       => 'Parent Service Category',
                'parent_item_colon' => 'Parent Service Category:',
                'edit_item'         => 'Edit Service Category',
                'update_item'       => 'Update Service Category',
                'add_new_item'      => 'Add New Service Category',
                'new_item_name'     => 'New Service Category Name',
                'menu_name'         => 'Categories',
            ),
            'hierarchical'      => true,
            'public'            => true,
            'show_in_rest'      => true,
            'show_admin_column' => true,
            'rewrite'           => array('slug' => 'service-category'),
        ));

        // Project Categories
        register_taxonomy('project_category', 'project', array(
            'labels'            => array(
                'name'              => 'Project Categories',
                'singular_name'     => 'Project Category',
                'search_items'      => 'Search Project Categories',
                'all_items'         => 'All Project Categories',
                'parent_item'       => 'Parent Project Category',
                'parent_item_colon' => 'Parent Project Category:',
                'edit_item'         => 'Edit Project Category',
                'update_item'       => 'Update Project Category',
                'add_new_item'      => 'Add New Project Category',
                'new_item_name'     => 'New Project Category Name',
                'menu_name'         => 'Categories',
            ),
            'hierarchical'      => true,
            'public'            => true,
            'show_in_rest'      => true,
            'show_admin_column' => true,
            'rewrite'           => array('slug' => 'project-category'),
        ));

        // Position Categories (Departments)
        register_taxonomy('position_category', 'position', array(
            'labels'            => array(
                'name'              => 'Departments',
                'singular_name'     => 'Department',
                'search_items'      => 'Search Departments',
                'all_items'         => 'All Departments',
                'parent_item'       => 'Parent Department',
                'parent_item_colon' => 'Parent Department:',
                'edit_item'         => 'Edit Department',
                'update_item'       => 'Update Department',
                'add_new_item'      => 'Add New Department',
                'new_item_name'     => 'New Department Name',
                'menu_name'         => 'Departments',
            ),
            'hierarchical'      => true,
            'public'            => true,
            'show_in_rest'      => true,
            'show_admin_column' => true,
            'rewrite'           => array('slug' => 'department'),
        ));
    }

    /**
     * Expose custom fields to REST API
     */
    public function register_custom_fields_to_api() {
        // Register custom_fields for all post types
        $post_types = array('service', 'project', 'team', 'testimonial', 'position', 'certificate', 'location');

        foreach ($post_types as $post_type) {
            register_rest_field($post_type, 'custom_fields', array(
                'get_callback'    => array($this, 'get_custom_fields'),
                'update_callback' => null,
                'schema'          => null,
            ));

            // Register images field specifically for projects
            if ($post_type === 'project') {
                register_rest_field($post_type, 'images', array(
                    'get_callback'    => array($this, 'get_project_images'),
                    'update_callback' => null,
                    'schema'          => null,
                ));

                // Register pdfs field for projects
                register_rest_field($post_type, 'pdfs', array(
                    'get_callback'    => array($this, 'get_project_pdfs'),
                    'update_callback' => null,
                    'schema'          => null,
                ));
            }
        }
    }

    /**
     * Get custom fields for REST API response
     */
    public function get_custom_fields($object, $field_name, $request) {
        $post_id = $object['id'];
        $meta = get_post_meta($post_id, '', true);

        $clean_meta = array();
        foreach ($meta as $key => $value) {
            // Skip keys starting with underscore (internal)
            if (strpos($key, '_') !== 0) {
                $clean_meta[$key] = maybe_unserialize($value[0]);
            }
        }

        return $clean_meta;
    }

    /**
     * Get project images for REST API
     */
    public function get_project_images($object, $field_name, $request) {
        $post_id = $object['id'];
        $images = get_post_meta($post_id, 'project_images', true);

        if (!is_array($images)) {
            return array();
        }

        // Convert image IDs to full URLs
        $image_urls = array();
        foreach ($images as $image_id) {
            $url = wp_get_attachment_image_url($image_id, 'full');
            if ($url) {
                $image_urls[] = $url;
            }
        }

        return $image_urls;
    }

    /**
     * Get project PDFs for REST API
     */
    public function get_project_pdfs($object, $field_name, $request) {
        $post_id = $object['id'];
        $pdfs_data = get_post_meta($post_id, 'project_pdfs', true);

        if (!is_array($pdfs_data)) {
            return array();
        }

        // Build PDF array with URLs and metadata
        $pdfs = array();
        foreach ($pdfs_data as $pdf_data) {
            if (isset($pdf_data['pdf_id'])) {
                $url = wp_get_attachment_url($pdf_data['pdf_id']);
                if ($url) {
                    $pdf_item = array(
                        'url'         => $url,
                        'title'       => isset($pdf_data['title']) ? $pdf_data['title'] : '',
                        'description' => isset($pdf_data['description']) ? $pdf_data['description'] : '',
                        'type'        => isset($pdf_data['type']) ? $pdf_data['type'] : '',
                    );

                    // Add preview image if set
                    if (isset($pdf_data['preview_id']) && $pdf_data['preview_id']) {
                        $preview_url = wp_get_attachment_image_url($pdf_data['preview_id'], 'full');
                        if ($preview_url) {
                            $pdf_item['preview'] = $preview_url;
                        }
                    }

                    $pdfs[] = $pdf_item;
                }
            }
        }

        return $pdfs;
    }

    /**
     * Add meta boxes for custom fields
     */
    public function add_meta_boxes() {
        add_meta_box(
            'vp_service_details',
            'Service Details',
            array($this, 'service_meta_box_callback'),
            'service',
            'normal',
            'default'
        );

        add_meta_box(
            'vp_project_details',
            'Project Details',
            array($this, 'project_meta_box_callback'),
            'project',
            'normal',
            'default'
        );

        add_meta_box(
            'vp_project_documents',
            'Project Documents (PDFs)',
            array($this, 'project_documents_meta_box_callback'),
            'project',
            'normal',
            'default'
        );

        add_meta_box(
            'vp_team_details',
            'Team Member Details',
            array($this, 'team_meta_box_callback'),
            'team',
            'normal',
            'default'
        );

        add_meta_box(
            'vp_testimonial_details',
            'Testimonial Details',
            array($this, 'testimonial_meta_box_callback'),
            'testimonial',
            'normal',
            'default'
        );

        add_meta_box(
            'vp_position_details',
            'Position Details',
            array($this, 'position_meta_box_callback'),
            'position',
            'normal',
            'default'
        );

        add_meta_box(
            'vp_certificate_details',
            'Certificate Details',
            array($this, 'certificate_meta_box_callback'),
            'certificate',
            'normal',
            'default'
        );

        add_meta_box(
            'vp_location_details',
            'Location Details',
            array($this, 'location_meta_box_callback'),
            'location',
            'normal',
            'default'
        );
    }

    /**
     * Service meta box callback
     */
    public function service_meta_box_callback($post) {
        wp_nonce_field('vp_service_meta_box', 'vp_service_meta_box_nonce');

        $icon = get_post_meta($post->ID, 'service_icon', true);
        $featured = get_post_meta($post->ID, 'service_featured', true);

        echo '<div class="vp-meta-box">';
        echo '<p>';
        echo '<label for="service_icon"><strong>Service Icon:</strong></label><br>';
        echo '<input type="text" id="service_icon" name="service_icon" value="' . esc_attr($icon) . '" class="widefat" placeholder="e.g., mdi:cog">';
        echo '<small>Examples: mdi:cog, mdi:home, mdi:office-building, mdi:anchor</small>';
        echo '</p>';
        echo '<p>';
        echo '<label><input type="checkbox" name="service_featured" value="1" ' . checked($featured, '1', false) . '> ';
        echo '<strong>Featured Service</strong> (show on homepage)</label>';
        echo '</p>';
        echo '</div>';
    }

    /**
     * Project meta box callback
     */
    public function project_meta_box_callback($post) {
        wp_nonce_field('vp_project_meta_box', 'vp_project_meta_box_nonce');

        $location = get_post_meta($post->ID, 'project_location', true);
        $year = get_post_meta($post->ID, 'project_year', true);
        $sqft = get_post_meta($post->ID, 'project_sqft', true);
        $category = get_post_meta($post->ID, 'project_category', true);
        $featured = get_post_meta($post->ID, 'project_featured', true);

        echo '<div class="vp-meta-box">';
        echo '<p>';
        echo '<label for="project_location"><strong>Location:</strong></label><br>';
        echo '<input type="text" id="project_location" name="project_location" value="' . esc_attr($location) . '" class="widefat" placeholder="e.g., Tampa, FL">';
        echo '</p>';
        echo '<p>';
        echo '<label for="project_year"><strong>Year:</strong></label><br>';
        echo '<input type="text" id="project_year" name="project_year" value="' . esc_attr($year) . '" class="widefat" placeholder="e.g., 2024">';
        echo '</p>';
        echo '<p>';
        echo '<label for="project_sqft"><strong>Square Footage:</strong></label><br>';
        echo '<input type="text" id="project_sqft" name="project_sqft" value="' . esc_attr($sqft) . '" class="widefat" placeholder="e.g., 40,000 sq ft">';
        echo '</p>';
        echo '<p>';
        echo '<label for="project_category"><strong>Category:</strong></label><br>';
        echo '<select id="project_category" name="project_category" class="widefat">';
        echo '<option value="">Select category...</option>';
        echo '<option value="Commercial" ' . selected($category, 'Commercial', false) . '>Commercial</option>';
        echo '<option value="Industrial" ' . selected($category, 'Industrial', false) . '>Industrial</option>';
        echo '<option value="Marine" ' . selected($category, 'Marine', false) . '>Marine</option>';
        echo '<option value="Residential" ' . selected($category, 'Residential', false) . '>Residential</option>';
        echo '<option value="Municipal" ' . selected($category, 'Municipal', false) . '>Municipal</option>';
        echo '<option value="Healthcare" ' . selected($category, 'Healthcare', false) . '>Healthcare</option>';
        echo '<option value="Institutional" ' . selected($category, 'Institutional', false) . '>Institutional</option>';
        echo '</select>';
        echo '</p>';
        echo '<p>';
        echo '<label><input type="checkbox" name="project_featured" value="1" ' . checked($featured, '1', false) . '> ';
        echo '<strong>Featured Project</strong> (show on homepage)</label>';
        echo '</p>';
        echo '</div>';
    }

    /**
     * Project Documents meta box callback (NEW)
     */
    public function project_documents_meta_box_callback($post) {
        wp_nonce_field('vp_project_documents_meta_box', 'vp_project_documents_meta_box_nonce');

        $pdfs_data = get_post_meta($post->ID, 'project_pdfs', true);
        if (!is_array($pdfs_data)) {
            $pdfs_data = array();
        }

        echo '<div class="vp-documents-meta-box">';
        echo '<div id="vp-pdfs-container">';

        if (!empty($pdfs_data)) {
            foreach ($pdfs_data as $index => $pdf_data) {
                $pdf_id = isset($pdf_data['pdf_id']) ? $pdf_data['pdf_id'] : '';
                $preview_id = isset($pdf_data['preview_id']) ? $pdf_data['preview_id'] : '';
                $title = isset($pdf_data['title']) ? esc_attr($pdf_data['title']) : '';
                $description = isset($pdf_data['description']) ? esc_attr($pdf_data['description']) : '';
                $type = isset($pdf_data['type']) ? esc_attr($pdf_data['type']) : '';

                echo '<div class="vp-pdf-row" data-index="' . esc_attr($index) . '">';

                // PDF Upload
                echo '<div class="vp-pdf-field">';
                echo '<label><strong>PDF File:</strong></label><br>';
                echo '<div class="vp-media-upload-wrapper">';
                echo '<input type="hidden" class="vp-pdf-id" name="project_pdfs[' . esc_attr($index) . '][pdf_id]" value="' . esc_attr($pdf_id) . '" />';
                echo '<button type="button" class="button vp-upload-pdf-btn">Upload PDF</button>';
                echo '<button type="button" class="button vp-remove-pdf-btn" style="display:' . ($pdf_id ? 'inline-block' : 'none') . '">Remove</button>';
                echo '<span class="vp-pdf-filename">' . ($pdf_id ? esc_html(get_the_title($pdf_id)) : '') . '</span>';
                echo '</div>';
                echo '</div>';

                // Preview Image Upload
                echo '<div class="vp-pdf-field">';
                echo '<label><strong>Preview Image:</strong></label><br>';
                echo '<div class="vp-media-upload-wrapper">';
                echo '<input type="hidden" class="vp-preview-id" name="project_pdfs[' . esc_attr($index) . '][preview_id]" value="' . esc_attr($preview_id) . '" />';
                echo '<button type="button" class="button vp-upload-preview-btn">Upload Preview</button>';
                echo '<button type="button" class="button vp-remove-preview-btn" style="display:' . ($preview_id ? 'inline-block' : 'none') . '">Remove</button>';
                echo '<span class="vp-preview-filename">' . ($preview_id ? esc_html(get_the_title($preview_id)) : '') . '</span>';
                echo '<div class="vp-preview-thumb">' . ($preview_id ? wp_get_attachment_image($preview_id, 'thumbnail', false, array('class' => 'vp-preview-image')) : '') . '</div>';
                echo '</div>';
                echo '</div>';

                // Title
                echo '<div class="vp-pdf-field">';
                echo '<label><strong>Title:</strong></label><br>';
                echo '<input type="text" class="widefat" name="project_pdfs[' . esc_attr($index) . '][title]" value="' . $title . '" placeholder="e.g., Foundation Plan" />';
                echo '</div>';

                // Description
                echo '<div class="vp-pdf-field">';
                echo '<label><strong>Description:</strong></label><br>';
                echo '<input type="text" class="widefat" name="project_pdfs[' . esc_attr($index) . '][description]" value="' . $description . '" placeholder="Brief description of the document" />';
                echo '</div>';

                // Type
                echo '<div class="vp-pdf-field">';
                echo '<label><strong>Type:</strong></label><br>';
                echo '<select class="widefat" name="project_pdfs[' . esc_attr($index) . '][type]">';
                echo '<option value="">Select type...</option>';
                echo '<option value="Plan" ' . selected($type, 'Plan', false) . '>Plan</option>';
                echo '<option value="Elevation" ' . selected($type, 'Elevation', false) . '>Elevation</option>';
                echo '<option value="Section" ' . selected($type, 'Section', false) . '>Section</option>';
                echo '<option value="Detail" ' . selected($type, 'Detail', false) . '>Detail</option>';
                echo '<option value="Foundation" ' . selected($type, 'Foundation', false) . '>Foundation</option>';
                echo '<option value="Connection" ' . selected($type, 'Connection', false) . '>Connection</option>';
                echo '<option value="Schedule" ' . selected($type, 'Schedule', false) . '>Schedule</option>';
                echo '<option value="Calculation" ' . selected($type, 'Calculation', false) . '>Calculation</option>';
                echo '<option value="Drawing" ' . selected($type, 'Drawing', false) . '>Drawing</option>';
                echo '</select>';
                echo '</div>';

                // Remove PDF button
                echo '<div class="vp-pdf-field">';
                echo '<button type="button" class="button vp-delete-pdf-btn">Remove PDF Entry</button>';
                echo '</div>';

                echo '<hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />';
                echo '</div>';
            }
        }

        echo '</div>'; // End #vp-pdfs-container

        // Add New PDF button
        echo '<button type="button" class="button button-primary button-large" id="vp-add-pdf-btn">+ Add PDF Document</button>';

        echo '</div>'; // End .vp-documents-meta-box
    }

    /**
     * Team meta box callback
     */
    public function team_meta_box_callback($post) {
        wp_nonce_field('vp_team_meta_box', 'vp_team_meta_box_nonce');

        $job_title = get_post_meta($post->ID, 'team_job_title', true);
        $email = get_post_meta($post->ID, 'team_email', true);
        $phone = get_post_meta($post->ID, 'team_phone', true);
        $linkedin = get_post_meta($post->ID, 'team_linkedin', true);
        $display_order = get_post_meta($post->ID, 'team_display_order', true);

        echo '<div class="vp-meta-box">';
        echo '<p>';
        echo '<label for="team_job_title"><strong>Job Title:</strong></label><br>';
        echo '<input type="text" id="team_job_title" name="team_job_title" value="' . esc_attr($job_title) . '" class="widefat" placeholder="e.g., Senior Engineer">';
        echo '</p>';
        echo '<p>';
        echo '<label for="team_email"><strong>Email:</strong></label><br>';
        echo '<input type="email" id="team_email" name="team_email" value="' . esc_attr($email) . '" class="widefat">';
        echo '</p>';
        echo '<p>';
        echo '<label for="team_phone"><strong>Phone:</strong></label><br>';
        echo '<input type="tel" id="team_phone" name="team_phone" value="' . esc_attr($phone) . '" class="widefat">';
        echo '</p>';
        echo '<p>';
        echo '<label for="team_linkedin"><strong>LinkedIn URL:</strong></label><br>';
        echo '<input type="url" id="team_linkedin" name="team_linkedin" value="' . esc_attr($linkedin) . '" class="widefat">';
        echo '</p>';
        echo '<p>';
        echo '<label for="team_display_order"><strong>Display Order:</strong></label><br>';
        echo '<input type="number" id="team_display_order" name="team_display_order" value="' . esc_attr($display_order) . '" class="widefat" placeholder="Lower numbers appear first">';
        echo '</p>';
        echo '</div>';
    }

    /**
     * Testimonial meta box callback
     */
    public function testimonial_meta_box_callback($post) {
        wp_nonce_field('vp_testimonial_meta_box', 'vp_testimonial_meta_box_nonce');

        $client_name = get_post_meta($post->ID, 'testimonial_client_name', true);
        $company = get_post_meta($post->ID, 'testimonial_company', true);
        $rating = get_post_meta($post->ID, 'testimonial_rating', true);
        $role = get_post_meta($post->ID, 'testimonial_role', true);

        echo '<div class="vp-meta-box">';
        echo '<p>';
        echo '<label for="testimonial_client_name"><strong>Client Name:</strong></label><br>';
        echo '<input type="text" id="testimonial_client_name" name="testimonial_client_name" value="' . esc_attr($client_name) . '" class="widefat">';
        echo '<small>If different from the post title</small>';
        echo '</p>';
        echo '<p>';
        echo '<label for="testimonial_company"><strong>Company:</strong></label><br>';
        echo '<input type="text" id="testimonial_company" name="testimonial_company" value="' . esc_attr($company) . '" class="widefat">';
        echo '</p>';
        echo '<p>';
        echo '<label for="testimonial_role"><strong>Role/Title:</strong></label><br>';
        echo '<input type="text" id="testimonial_role" name="testimonial_role" value="' . esc_attr($role) . '" class="widefat">';
        echo '</p>';
        echo '<p>';
        echo '<label for="testimonial_rating"><strong>Rating:</strong></label><br>';
        echo '<select id="testimonial_rating" name="testimonial_rating" class="widefat">';
        echo '<option value="">Select rating...</option>';
        echo '<option value="5" ' . selected($rating, '5', false) . '>⭐⭐⭐⭐⭐ (5)</option>';
        echo '<option value="4" ' . selected($rating, '4', false) . '>⭐⭐⭐⭐ (4)</option>';
        echo '<option value="3" ' . selected($rating, '3', false) . '>⭐⭐⭐ (3)</option>';
        echo '<option value="2" ' . selected($rating, '2', false) . '>⭐⭐ (2)</option>';
        echo '<option value="1" ' . selected($rating, '1', false) . '>⭐ (1)</option>';
        echo '</select>';
        echo '</p>';
        echo '<p><em><strong>Note:</strong> Put the actual testimonial quote in the main content editor above.</em></p>';
        echo '</div>';
    }

    /**
     * Position meta box callback
     */
    public function position_meta_box_callback($post) {
        wp_nonce_field('vp_position_meta_box', 'vp_position_meta_box_nonce');

        $location     = get_post_meta($post->ID, 'position_location', true);
        $type         = get_post_meta($post->ID, 'position_type', true);
        $department   = get_post_meta($post->ID, 'position_department', true);
        $experience   = get_post_meta($post->ID, 'position_experience', true);
        $salary       = get_post_meta($post->ID, 'position_salary', true);
        $icon         = get_post_meta($post->ID, 'position_icon', true);
        $status       = get_post_meta($post->ID, 'position_status', true);

        echo '<div class="vp-meta-box">';

        // Status (Open/Closed)
        echo '<p>';
        echo '<label><strong>Status:</strong></label><br>';
        echo '<select id="position_status" name="position_status" class="widefat">';
        echo '<option value="open" ' . selected($status, 'open', false) . '>Open</option>';
        echo '<option value="closed" ' . selected($status, 'closed', false) . '>Closed</option>';
        echo '<option value="pending" ' . selected($status, 'pending', false) . '>Coming Soon</option>';
        echo '</select>';
        echo '</p>';

        // Location
        echo '<p>';
        echo '<label for="position_location"><strong>Location:</strong></label><br>';
        echo '<input type="text" id="position_location" name="position_location" value="' . esc_attr($location) . '" class="widefat" placeholder="e.g., Tampa, FL">';
        echo '</p>';

        // Employment Type
        echo '<p>';
        echo '<label for="position_type"><strong>Employment Type:</strong></label><br>';
        echo '<select id="position_type" name="position_type" class="widefat">';
        echo '<option value="">Select type...</option>';
        echo '<option value="Full-time" ' . selected($type, 'Full-time', false) . '>Full-time</option>';
        echo '<option value="Part-time" ' . selected($type, 'Part-time', false) . '>Part-time</option>';
        echo '<option value="Contract" ' . selected($type, 'Contract', false) . '>Contract</option>';
        echo '<option value="Internship" ' . selected($type, 'Internship', false) . '>Internship</option>';
        echo '</select>';
        echo '</p>';

        // Department
        echo '<p>';
        echo '<label for="position_department"><strong>Department:</strong></label><br>';
        echo '<select id="position_department" name="position_department" class="widefat">';
        echo '<option value="">Select department...</option>';
        echo '<option value="Engineering" ' . selected($department, 'Engineering', false) . '>Engineering</option>';
        echo '<option value="Design" ' . selected($department, 'Design', false) . '>Design</option>';
        echo '<option value="Management" ' . selected($department, 'Management', false) . '>Management</option>';
        echo '<option value="Admin" ' . selected($department, 'Admin', false) . '>Admin</option>';
        echo '</select>';
        echo '</p>';

        // Experience Level
        echo '<p>';
        echo '<label for="position_experience"><strong>Experience Required:</strong></label><br>';
        echo '<input type="text" id="position_experience" name="position_experience" value="' . esc_attr($experience) . '" class="widefat" placeholder="e.g., 3+ years, Entry Level">';
        echo '</p>';

        // Salary Range
        echo '<p>';
        echo '<label for="position_salary"><strong>Salary Range:</strong></label><br>';
        echo '<input type="text" id="position_salary" name="position_salary" value="' . esc_attr($salary) . '" class="widefat" placeholder="e.g., $80,000 - $100,000">';
        echo '</p>';

        // Icon
        echo '<p>';
        echo '<label for="position_icon"><strong>Icon:</strong></label><br>';
        echo '<input type="text" id="position_icon" name="position_icon" value="' . esc_attr($icon) . '" class="widefat" placeholder="e.g., mdi:calculator">';
        echo '<small>Examples: mdi:calculator, mdi:monitor, mdi:clipboard-check</small>';
        echo '</p>';

        echo '</div>';
    }

    /**
     * Certificate meta box callback
     */
    public function certificate_meta_box_callback($post) {
        wp_nonce_field('vp_certificate_meta_box', 'vp_certificate_meta_box_nonce');

        $url      = get_post_meta($post->ID, 'certificate_url', true);
        $issuer   = get_post_meta($post->ID, 'certificate_issuer', true);
        $year     = get_post_meta($post->ID, 'certificate_year', true);
        $type     = get_post_meta($post->ID, 'certificate_type', true);
        $icon     = get_post_meta($post->ID, 'certificate_icon', true);
        $featured = get_post_meta($post->ID, 'certificate_featured', true);

        echo '<div class="vp-meta-box">';

        // Issuer
        echo '<p>';
        echo '<label for="certificate_issuer"><strong>Issuing Organization:</strong></label><br>';
        echo '<input type="text" id="certificate_issuer" name="certificate_issuer" value="' . esc_attr($issuer) . '" class="widefat" placeholder="e.g., AISC, ACI, Florida Board">';
        echo '</p>';

        // Certificate Type
        echo '<p>';
        echo '<label for="certificate_type"><strong>Certificate Type:</strong></label><br>';
        echo '<select id="certificate_type" name="certificate_type" class="widefat">';
        echo '<option value="">Select type...</option>';
        echo '<option value="Certification" ' . selected($type, 'Certification', false) . '>Certification</option>';
        echo '<option value="License" ' . selected($type, 'License', false) . '>License</option>';
        echo '<option value="Membership" ' . selected($type, 'Membership', false) . '>Membership</option>';
        echo '<option value="Affiliation" ' . selected($type, 'Affiliation', false) . '>Affiliation</option>';
        echo '<option value="Award" ' . selected($type, 'Award', false) . '>Award</option>';
        echo '</select>';
        echo '</p>';

        // Year
        echo '<p>';
        echo '<label for="certificate_year"><strong>Year (if applicable):</strong></label><br>';
        echo '<input type="text" id="certificate_year" name="certificate_year" value="' . esc_attr($year) . '" class="widefat" placeholder="e.g., 2024 or 2020-2024">';
        echo '</p>';

        // URL
        echo '<p>';
        echo '<label for="certificate_url"><strong>External URL (optional):</strong></label><br>';
        echo '<input type="url" id="certificate_url" name="certificate_url" value="' . esc_attr($url) . '" class="widefat" placeholder="https://...">';
        echo '</p>';

        // Icon
        echo '<p>';
        echo '<label for="certificate_icon"><strong>Icon (optional):</strong></label><br>';
        echo '<input type="text" id="certificate_icon" name="certificate_icon" value="' . esc_attr($icon) . '" class="widefat" placeholder="e.g., mdi:certificate">';
        echo '<small>Examples: mdi:certificate, mdi:award, mdi:school, mdi:shield-check</small>';
        echo '</p>';

        // Featured
        echo '<p>';
        echo '<label><input type="checkbox" name="certificate_featured" value="1" ' . checked($featured, '1', false) . '> ';
        echo '<strong>Featured</strong> (highlight on about page)</label>';
        echo '</p>';

        echo '</div>';
    }

    /**
     * Location meta box callback
     */
    public function location_meta_box_callback($post) {
        wp_nonce_field('vp_location_meta_box', 'vp_location_meta_box_nonce');

        $state    = get_post_meta($post->ID, 'location_state', true);
        $region   = get_post_meta($post->ID, 'location_region', true);
        $featured = get_post_meta($post->ID, 'location_featured', true);

        echo '<div class="vp-meta-box">';

        // State/County
        echo '<p>';
        echo '<label for="location_state"><strong>State/County:</strong></label><br>';
        echo '<input type="text" id="location_state" name="location_state" value="' . esc_attr($state) . '" class="widefat" placeholder="e.g., Hillsborough County, Pinellas County">';
        echo '</p>';

        // Region
        echo '<p>';
        echo '<label for="location_region"><strong>Region:</strong></label><br>';
        echo '<input type="text" id="location_region" name="location_region" value="' . esc_attr($region) . '" class="widefat" placeholder="e.g., Tampa Bay Area, Central Florida">';
        echo '</p>';

        // Featured
        echo '<p>';
        echo '<label><input type="checkbox" name="location_featured" value="1" ' . checked($featured, '1', false) . '> ';
        echo '<strong>Featured</strong> (highlight on about page)</label>';
        echo '</p>';

        echo '</div>';
    }

    /**
     * Save custom fields
     */
    public function save_custom_fields($post_id, $post) {
        // Check autosave
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }

        // Verify permissions
        if (!current_user_can('edit_post', $post_id)) {
            return;
        }

        // Save Service fields
        if (isset($_POST['vp_service_meta_box_nonce']) && wp_verify_nonce($_POST['vp_service_meta_box_nonce'], 'vp_service_meta_box')) {
            if (isset($_POST['service_icon'])) {
                update_post_meta($post_id, 'service_icon', sanitize_text_field($_POST['service_icon']));
            }
            $featured = isset($_POST['service_featured']) ? '1' : '0';
            update_post_meta($post_id, 'service_featured', $featured);
        }

        // Save Project fields
        if (isset($_POST['vp_project_meta_box_nonce']) && wp_verify_nonce($_POST['vp_project_meta_box_nonce'], 'vp_project_meta_box')) {
            if (isset($_POST['project_location'])) {
                update_post_meta($post_id, 'project_location', sanitize_text_field($_POST['project_location']));
            }
            if (isset($_POST['project_year'])) {
                update_post_meta($post_id, 'project_year', sanitize_text_field($_POST['project_year']));
            }
            if (isset($_POST['project_sqft'])) {
                update_post_meta($post_id, 'project_sqft', sanitize_text_field($_POST['project_sqft']));
            }
            if (isset($_POST['project_category'])) {
                update_post_meta($post_id, 'project_category', sanitize_text_field($_POST['project_category']));
            }
            $featured = isset($_POST['project_featured']) ? '1' : '0';
            update_post_meta($post_id, 'project_featured', $featured);
        }

        // Save Project Documents (PDFs) fields
        if (isset($_POST['vp_project_documents_meta_box_nonce']) && wp_verify_nonce($_POST['vp_project_documents_meta_box_nonce'], 'vp_project_documents_meta_box')) {
            if (isset($_POST['project_pdfs']) && is_array($_POST['project_pdfs'])) {
                // Sanitize and save PDF data
                $clean_pdfs = array();

                foreach ($_POST['project_pdfs'] as $pdf_data) {
                    $clean_pdf = array();

                    // Only include entries that have a PDF file attached
                    if (!empty($pdf_data['pdf_id'])) {
                        $clean_pdf['pdf_id'] = intval($pdf_data['pdf_id']);

                        if (!empty($pdf_data['preview_id'])) {
                            $clean_pdf['preview_id'] = intval($pdf_data['preview_id']);
                        }

                        if (!empty($pdf_data['title'])) {
                            $clean_pdf['title'] = sanitize_text_field($pdf_data['title']);
                        }

                        if (!empty($pdf_data['description'])) {
                            $clean_pdf['description'] = sanitize_text_field($pdf_data['description']);
                        }

                        if (!empty($pdf_data['type'])) {
                            $clean_pdf['type'] = sanitize_text_field($pdf_data['type']);
                        }

                        $clean_pdfs[] = $clean_pdf;
                    }
                }

                update_post_meta($post_id, 'project_pdfs', $clean_pdfs);
            } else {
                // No PDFs, delete the meta
                delete_post_meta($post_id, 'project_pdfs');
            }
        }

        // Save Team fields
        if (isset($_POST['vp_team_meta_box_nonce']) && wp_verify_nonce($_POST['vp_team_meta_box_nonce'], 'vp_team_meta_box')) {
            if (isset($_POST['team_job_title'])) {
                update_post_meta($post_id, 'team_job_title', sanitize_text_field($_POST['team_job_title']));
            }
            if (isset($_POST['team_email'])) {
                update_post_meta($post_id, 'team_email', sanitize_email($_POST['team_email']));
            }
            if (isset($_POST['team_phone'])) {
                update_post_meta($post_id, 'team_phone', sanitize_text_field($_POST['team_phone']));
            }
            if (isset($_POST['team_linkedin'])) {
                update_post_meta($post_id, 'team_linkedin', esc_url_raw($_POST['team_linkedin']));
            }
            if (isset($_POST['team_display_order'])) {
                update_post_meta($post_id, 'team_display_order', intval($_POST['team_display_order']));
            }
        }

        // Save Testimonial fields
        if (isset($_POST['vp_testimonial_meta_box_nonce']) && wp_verify_nonce($_POST['vp_testimonial_meta_box_nonce'], 'vp_testimonial_meta_box')) {
            if (isset($_POST['testimonial_client_name'])) {
                update_post_meta($post_id, 'testimonial_client_name', sanitize_text_field($_POST['testimonial_client_name']));
            }
            if (isset($_POST['testimonial_company'])) {
                update_post_meta($post_id, 'testimonial_company', sanitize_text_field($_POST['testimonial_company']));
            }
            if (isset($_POST['testimonial_role'])) {
                update_post_meta($post_id, 'testimonial_role', sanitize_text_field($_POST['testimonial_role']));
            }
            if (isset($_POST['testimonial_rating'])) {
                update_post_meta($post_id, 'testimonial_rating', intval($_POST['testimonial_rating']));
            }
        }

        // Save Position fields
        if (isset($_POST['vp_position_meta_box_nonce']) && wp_verify_nonce($_POST['vp_position_meta_box_nonce'], 'vp_position_meta_box')) {
            $fields = array(
                'position_location'    => 'sanitize_text_field',
                'position_type'        => 'sanitize_text_field',
                'position_department'  => 'sanitize_text_field',
                'position_experience'  => 'sanitize_text_field',
                'position_salary'      => 'sanitize_text_field',
                'position_icon'        => 'sanitize_text_field',
                'position_status'      => 'sanitize_text_field',
            );

            foreach ($fields as $field => $sanitize_callback) {
                if (isset($_POST[$field])) {
                    update_post_meta($post_id, $field, call_user_func($sanitize_callback, $_POST[$field]));
                }
            }

            // Set default status if not provided
            if (!isset($_POST['position_status'])) {
                update_post_meta($post_id, 'position_status', 'open');
            }
        }

        // Save Certificate fields
        if (isset($_POST['vp_certificate_meta_box_nonce']) && wp_verify_nonce($_POST['vp_certificate_meta_box_nonce'], 'vp_certificate_meta_box')) {
            $fields = array(
                'certificate_url'     => 'esc_url_raw',
                'certificate_issuer'  => 'sanitize_text_field',
                'certificate_year'    => 'sanitize_text_field',
                'certificate_type'    => 'sanitize_text_field',
                'certificate_icon'    => 'sanitize_text_field',
                'certificate_featured' => 'sanitize_text_field',
            );

            foreach ($fields as $field => $sanitize_callback) {
                if (isset($_POST[$field])) {
                    update_post_meta($post_id, $field, call_user_func($sanitize_callback, $_POST[$field]));
                }
            }
        }

        // Save Location fields
        if (isset($_POST['vp_location_meta_box_nonce']) && wp_verify_nonce($_POST['vp_location_meta_box_nonce'], 'vp_location_meta_box')) {
            $fields = array(
                'location_state'     => 'sanitize_text_field',
                'location_region'    => 'sanitize_text_field',
                'location_featured'  => 'sanitize_text_field',
            );

            foreach ($fields as $field => $sanitize_callback) {
                if (isset($_POST[$field])) {
                    update_post_meta($post_id, $field, call_user_func($sanitize_callback, $_POST[$field]));
                }
            }
        }
    }
}

// Activation hook
function vp_associates_cpt_activate() {
    $vp_cpt = new VP_Associates_CPT();
    $vp_cpt->register_cpts();
    $vp_cpt->register_taxonomies();
    flush_rewrite_rules();
}
register_activation_hook(__FILE__, 'vp_associates_cpt_activate');

// Deactivation hook
function vp_associates_cpt_deactivate() {
    flush_rewrite_rules();
}
register_deactivation_hook(__FILE__, 'vp_associates_cpt_deactivate');

// Initialize the plugin
new VP_Associates_CPT();
