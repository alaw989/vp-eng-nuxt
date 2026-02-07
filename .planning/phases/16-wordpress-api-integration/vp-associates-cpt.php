<?php
/**
 * Plugin Name: VP Associates Custom Post Types
 * Plugin URI: https://vp-associates.com
 * Description: Registers Custom Post Types for Services, Projects, Team, and Testimonials with REST API support. Uses native WordPress custom fields (no ACF required).
 * Version: 1.2.0
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
    }

    /**
     * Register all Custom Post Types
     */
    public function register_cpts() {
        $this->register_services_cpt();
        $this->register_projects_cpt();
        $this->register_team_cpt();
        $this->register_testimonials_cpt();
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
    }

    /**
     * Expose custom fields to REST API
     */
    public function register_custom_fields_to_api() {
        $post_types = array('service', 'project', 'team', 'testimonial');

        foreach ($post_types as $post_type) {
            register_rest_field($post_type, 'custom_fields', array(
                'get_callback'    => array($this, 'get_custom_fields'),
                'update_callback' => null,
                'schema'          => null,
            ));
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
        echo '</select>';
        echo '</p>';
        echo '<p>';
        echo '<label><input type="checkbox" name="project_featured" value="1" ' . checked($featured, '1', false) . '> ';
        echo '<strong>Featured Project</strong> (show on homepage)</label>';
        echo '</p>';
        echo '</div>';
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
